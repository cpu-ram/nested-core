import { Temporal } from 'temporal-polyfill';
import { BaseNode } from '../node/BaseNode.ts';
import { TextareaAutosize } from "@mui/base";

type TaskArgs = {
  done?: boolean;
  dueDate?: Temporal.PlainDate;
  tags?: string[];
  instructions?: string;
};

export class Task extends BaseNode {
  done: boolean;
  dueDate: Temporal.PlainDate | null;
  instructions: string | null;
  tags: string[] | null;

  static readonly nodeTypeName = 'task';

  constructor(args: TaskArgs) {
    super({ ...args, type: Task.nodeTypeName });
    this.done = args.done ?? false;
    this.dueDate = args.dueDate ? Temporal.PlainDate.from(args.dueDate) : null;
    this.tags = args.tags || null;
    this.instructions = args.instructions || null;
  }

  toggleStatus(): void {
    this.done = !this.done;
  }
}
