export class Edge {
  constructor(source, destination) {
    this.id = `${source}-${destination}`;
    this.source = source;
    this.target = destination;
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
