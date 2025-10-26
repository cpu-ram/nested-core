export type BaseNodeArgs = {
  id?: string;
  children?: BaseNode[] | null;
  title: string;
  body?: string | null;
  type?: string;
};

export class BaseNode {
  id: string;
  children: BaseNode[] = [] as BaseNode[];
  title: string;
  body: string | null;
  type: string | null;

  constructor(args: BaseNodeArgs) {
    this.id = args.id ?? crypto.randomUUID();
    this.title = args.title;
    this.body = args.body ?? null;
    this.type = args.type ?? null;
  }
}
