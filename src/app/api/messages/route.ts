import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readDb, writeDb, Conversation, Message } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversationId = req.nextUrl.searchParams.get('conversationId');
    const userIdParam = req.nextUrl.searchParams.get('userId');
    const db = readDb();

    if (user.role === 'ADMIN') {
      let targetConv: Conversation | undefined;

      if (conversationId) {
        targetConv = db.conversations.find((c) => c.id === conversationId);
      } else if (userIdParam) {
        targetConv = db.conversations.find((c) => c.userId === userIdParam);
        if (!targetConv) {
          const targetUser = db.users.find((u) => u.id === userIdParam);
          if (targetUser) {
            targetConv = {
              id: `conv_${Date.now()}_${targetUser.id.substring(0, 6)}`,
              userId: targetUser.id,
              userName: targetUser.fullName,
              userEmail: targetUser.email,
              subject: 'Tesla Support & Private Communication',
              status: 'OPEN',
              unreadUserCount: 0,
              unreadAdminCount: 0,
              lastMessageAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
            };
            db.conversations.unshift(targetConv);
            writeDb(db);
          }
        }
      }

      if (targetConv) {
        // Clear unread count for admin when opening this conversation
        targetConv.unreadAdminCount = 0;
        // Mark messages sent by user as read
        db.messages.forEach((m) => {
          if (m.conversationId === targetConv!.id && m.senderRole !== 'ADMIN') {
            m.isRead = true;
          }
        });
        writeDb(db);

        const messages = db.messages.filter((m) => m.conversationId === targetConv!.id);
        return NextResponse.json({ conversation: targetConv, messages });
      }

      if (conversationId && !targetConv) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }

      // Return all conversations sorted by most recent activity
      const sortedConversations = [...db.conversations].sort(
        (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
      const unreadTotal = db.conversations.reduce((sum, c) => sum + (c.unreadAdminCount || 0), 0);

      return NextResponse.json({ conversations: sortedConversations, unreadTotal });
    } else {
      // Regular user
      let conv = db.conversations.find((c) => c.userId === user.id);
      if (!conv) {
        conv = {
          id: `conv_${Date.now()}_${user.id.substring(0, 6)}`,
          userId: user.id,
          userName: user.fullName,
          userEmail: user.email,
          subject: 'Tesla Investment Support',
          status: 'OPEN',
          unreadUserCount: 0,
          unreadAdminCount: 0,
          lastMessageAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        db.conversations.push(conv);
        writeDb(db);
      } else {
        // Clear unread count for user when opening their conversation
        conv.unreadUserCount = 0;
        // Mark all admin messages as read
        db.messages.forEach((m) => {
          if (m.conversationId === conv!.id && m.senderRole === 'ADMIN') {
            m.isRead = true;
          }
        });
        // Clear message notifications for this user
        db.notifications.forEach((n) => {
          if (n.userId === user.id && n.link === '/messages') {
            n.isRead = true;
          }
        });
        writeDb(db);
      }

      const messages = db.messages.filter((m) => m.conversationId === conv.id);
      return NextResponse.json({ conversation: conv, messages });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching messages';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, conversationId, userId } = await req.json();
    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Message content cannot be empty' }, { status: 400 });
    }

    const db = readDb();
    let targetConv: Conversation | undefined;

    if (user.role === 'ADMIN') {
      if (conversationId) {
        targetConv = db.conversations.find((c) => c.id === conversationId);
      }
      if (!targetConv && userId) {
        targetConv = db.conversations.find((c) => c.userId === userId);
        if (!targetConv) {
          const targetUser = db.users.find((u) => u.id === userId);
          if (!targetUser) {
            return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
          }
          targetConv = {
            id: `conv_${Date.now()}_${targetUser.id.substring(0, 6)}`,
            userId: targetUser.id,
            userName: targetUser.fullName,
            userEmail: targetUser.email,
            subject: 'Tesla Support & Private Communication',
            status: 'OPEN',
            unreadUserCount: 0,
            unreadAdminCount: 0,
            lastMessageAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          };
          db.conversations.unshift(targetConv);
        }
      }

      if (!targetConv) {
        return NextResponse.json({ error: 'Conversation or target user not found' }, { status: 404 });
      }

      targetConv.unreadUserCount = (targetConv.unreadUserCount || 0) + 1;
      targetConv.lastMessageAt = new Date().toISOString();

      // Create high-visibility unread notification for the investor
      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        userId: targetConv.userId,
        title: 'New Message from Support Desk',
        message: content.length > 80 ? `${content.substring(0, 80)}...` : content,
        type: 'INFO',
        isRead: false,
        link: '/messages',
        createdAt: new Date().toISOString(),
      });
    } else {
      // Investor sending message to Admin
      targetConv = db.conversations.find((c) => c.userId === user.id);
      if (!targetConv) {
        targetConv = {
          id: `conv_${Date.now()}_${user.id.substring(0, 6)}`,
          userId: user.id,
          userName: user.fullName,
          userEmail: user.email,
          subject: 'Tesla Investment Support',
          status: 'OPEN',
          unreadUserCount: 0,
          unreadAdminCount: 1,
          lastMessageAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        db.conversations.unshift(targetConv);
      } else {
        targetConv.unreadAdminCount = (targetConv.unreadAdminCount || 0) + 1;
        targetConv.lastMessageAt = new Date().toISOString();
      }
    }

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      conversationId: targetConv.id,
      senderId: user.id,
      senderName: user.fullName,
      senderRole: user.role,
      content: content.trim(),
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    db.messages.push(newMsg);
    writeDb(db);

    return NextResponse.json({ success: true, message: newMsg, conversation: targetConv });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error sending message';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
