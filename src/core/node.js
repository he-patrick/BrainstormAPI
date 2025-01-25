export class Node {
    constructor({
        id,
        label,
        description = '',
        parentId = null,
        level = 0
    }) {
        this.id = id;
        this.label = label;
        this.description = description;
        this.parentId = parentId;
        this.level = level;
        this.children = new Set();
    }

    toVisNetworkFormat(color) {
        return {
            id: this.id,
            label: this.label,
            level: this.level,
            color: color,
            size: 30
        };
    }
}
