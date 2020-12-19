class CreateContainer{
  public container:Map<Symbol,{callback:Function}>
  constructor(){
    this.container = new Map();
  }
  get(key:Symbol){
    let keyValue = this.container.get(key);
    if(keyValue){
      return keyValue.callback();
    }else{
      return "不存在此值"
    }
  }
  bind(key:Symbol,value:Function){
    this.container.set(key,{callback:value});
  }
}

export default CreateContainer;