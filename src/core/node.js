export class Node {
    constructor({
        id = null,
        label,
        description = '',
        parentId = null,
        level = 0,
        sessionId = null
    }) {
        this.id = id || uuidv4();
        this.label = label;
        this.description = description;
        this.parentId = parentId;
        this.level = level;
        this.sessionId = sessionId;
        this.children = new Set();
    }

    update(updates) {
        Object.assign(this, updates);
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

    clone() {
        const cloned = new Node({
            id: this.id,
            label: this.label,
            description: this.description,
            parentId: this.parentId,
            level: this.level,
            sessionId: this.sessionId
        });
        this.children.forEach(childId => cloned.children.add(childId));
        return cloned;
    }
}
