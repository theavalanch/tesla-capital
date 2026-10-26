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
    const db = readDb();

    if (user.role === 'ADMIN') {
      if (conversationId) {
        const messages = db.messages.filter((m) => m.conversationId === conversationId);
        // Mark admin unread count as 0
        const conv = db.conversations.find((c) => c.id === conversationId);
        if (conv) {
          conv.unreadAdminCount = 0;
          writeDb(db);
        }
        return NextResponse.json({ conversation: conv, messages });
      }
      return NextResponse.json({ conversations: db.conversations });
    } else {
      // Regular user
      let conv = db.conversations.find((c) => c.userId === user.id);
      if (!conv) {
        conv = {
          id: `conv_${Date.now()}`,
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
        conv.unreadUserCount = 0;
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

    const { content, conversationId } = await req.json();
    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Message content cannot be empty' }, { status: 400 });
    }

    const db = readDb();
    let targetConv: Conversation | undefined;

    if (user.role === 'ADMIN') {
      targetConv = db.conversations.find((c) => c.id === conversationId);
      if (!targetConv) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
      targetConv.unreadUserCount += 1;
      targetConv.lastMessageAt = new Date().toISOString();

      db.notifications.push({
        id: `notif_${Date.now()}`,
        userId: targetConv.userId,
        title: 'New Message from Support',
        message: content.length > 70 ? `${content.substring(0, 70)}...` : content,
        type: 'INFO',
        isRead: false,
        link: '/messages',
        createdAt: new Date().toISOString(),
      });
    } else {
      targetConv = db.conversations.find((c) => c.userId === user.id);
      if (!targetConv) {
        targetConv = {
          id: `conv_${Date.now()}`,
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
        db.conversations.push(targetConv);
      } else {
        targetConv.unreadAdminCount += 1;
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
