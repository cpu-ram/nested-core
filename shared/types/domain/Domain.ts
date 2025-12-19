import { BaseNode } from '../node/BaseNode';
import { BaseNodeArgs } from '../node/BaseNode.ts';

type DomainArgs = BaseNodeArgs;
export class Domain extends BaseNode {
  static readonly nodeTypeName = 'domain';
  constructor(args: DomainArgs) {
    super({ ...args, type: Domain.nodeTypeName });
    this.archived = args.archived ?? false;
  }
}
