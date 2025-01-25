export class Node {
    constructor({
        id = null,
        label,
        description = '',
        parentId = null,
        level = 0,
        priority = 1,
        sessionId = null
    }) {
        this.id = id || uuidv4();
        this.label = label;
        this.description = description;
        this.parentId = parentId;
        this.level = level;
        this.priority = priority;
        this.sessionId = sessionId;
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
            size: this.priority * 5
        };
    }

    clone() {
        return new Node({
            id: this.id,
            label: this.label,
            description: this.description,
            parentId: this.parentId,
            level: this.level,
            priority: this.priority,
            sessionId: this.sessionId
        });
    }
}
