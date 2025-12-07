import { BaseNode } from '../../../shared/types/node/BaseNode.ts';
import { Domain } from '../../../shared/types/domain/Domain.ts';
import { Task } from '../../../shared/types/task/Task.ts';

const seedData = new Domain({
  title: 'root',
  children: [],
});

function loadLocalStorageData(): BaseNode | null {
  const stored = localStorage.getItem('taskData');
  return stored ? parseObject(JSON.parse(stored)) : seedData;
}

function parseObject(object: any): BaseNode {
  let result: BaseNode | null = null;

  switch (object.type) {
    case 'domain':
      result = new Domain(object);
      break;
    case 'task':
      result = new Task(object);
      break;
    default:
      throw new Error(`Unknown node type: ${object.type}`);
  }
  if (!result) throw new Error('Internal error.');

  result.children = (object.children ?? []).map((x) => parseObject(x));
  return result;
}

export function getData(options?: { testMode: boolean }) {
  let result = loadLocalStorageData();

  if (options?.testMode) {
    try {
      let jsonString = JSON.stringify(firstPass);
      let plainObject = JSON.parse(jsonString);
      result = parseObject(plainObject);
    } catch (error) {
      console.log(error);
    }
  }

  return result;
}
