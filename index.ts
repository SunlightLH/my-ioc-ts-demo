import CreateContainer from './contaner';
import {parseScript} from "esprima";
import { Pattern } from 'estree';
import 'reflect-metadata';

interface typesInter{
  [index:string]:Symbol
}
const TYPES:typesInter = {
  Service:Symbol.for("Service")
}
let container = new CreateContainer();
container.bind(TYPES.Service,()=>new IService());

/**定义 - 服务器接口 */
interface serviceIter{
  log(str:string):void;
}

/**定义 - 服务器类 */
class IService implements serviceIter{
  log(str:string):void{
    console.log(str);
  }
}

function hasKey<O extends Object>(obj:O,key:keyof any):key is keyof O{
  return obj.hasOwnProperty(key);
}

function getParam(Controller:Function){
  const ast = parseScript(Controller.toString());
  const node = ast.body[0];
  let paramsObjArr:Pattern[] = [];
  let paramsArr:string[] = [];
  if(node.type === 'FunctionDeclaration'){
    paramsObjArr = node.params;
    paramsObjArr.forEach(item=>{
      if(item.type == 'Identifier'){
        paramsArr.push(item.name);
      }
    })
  }
  return paramsArr;
}

/**类装饰器 */
function provideCon<T extends {new (...args:any[]):{}}>(Controller:T){
  class SuperController extends Controller{
    constructor(...args:any[]){
      super(args);
      const paramsArr = getParam(Controller);
      let param:string;
      for(param of paramsArr){
        if(hasKey(this,param)){
          // this[param] = container.get(TYPES[param]);
          this[param] = Reflect.getMetadata(TYPES[param],Controller);
        }
      }
    }
  };
  return SuperController;
}

/**属性装饰器 */
function inject(pram:Symbol){
  return function(target:Function,key:string,index:number){
    if(!key){
      Reflect.defineMetadata(
        pram,
        container.get(pram),
        target
      )
    }
  }
}

/**定义 - 控制器 */
@provideCon
class Controller{
  public Service:IService;
  constructor(@inject(TYPES.Service) Service?:IService){
    this.Service = Service!;
  }
  logger(){
    this.Service.log("-----显示信息------");
  }
}

const controller = new Controller();
controller.logger();