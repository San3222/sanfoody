import mongoose, { Schema, Document } from "mongoose";

export interface IMessage {
  senderId: mongoose.Types.ObjectId;
  senderRole: 'customer' | 'support';
  message: string;
  createdAt: Date;
}

export interface IChat extends Document {
  customerId: mongoose.Types.ObjectId;
  ticketId?: string;
  subject: string;
  status: 'open' | 'closed';
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderRole: { type: String, enum: ['customer', 'support'], required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const ChatSchema = new Schema<IChat>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ticketId: { type: String },
    subject: { type: String, required: true },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    messages: [MessageSchema],
  },
  { timestamps: true }
);

export const Chat = mongoose.model<IChat>("Chat", ChatSchema);