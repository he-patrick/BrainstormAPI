export class Edge {
  constructor(source, target) {
    this.id = crypto.randomUUID();
    this.source = source;
    this.target = target;
  }

  toVisNetworkFormat() {
    return {
      id: this.id,
      from: this.source,
      to: this.target,
      dashes: false,
      color: '#999999'
    };
  }
}
