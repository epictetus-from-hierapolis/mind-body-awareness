export interface JournalRecordInterface {
    id: string;
    timestamp: number;
    sensations: string[];
    rootCause: string;
    positiveEmotions: string[];
    negativeEmotions: string[];
    needs: { [key: string]: string };
}

export class JournalRecord implements JournalRecordInterface {
    public id: string = (typeof crypto !== 'undefined' && crypto.randomUUID) 
        ? crypto.randomUUID() 
        : Date.now().toString(36) + Math.random().toString(36).substring(2);
    public timestamp: number = Date.now();
    public sensations: string[] = [];
    public rootCause: string = "";
    public positiveEmotions: string[] = [];
    public negativeEmotions: string[] = [];
    public needs: { [key: string]: string } = {};

    constructor(init?: Partial<JournalRecordInterface>) {
        if (init) {
            this.id = init.id || this.id;
            this.timestamp = init.timestamp || this.timestamp;
            this.rootCause = init.rootCause || "";
            this.sensations = Array.isArray(init.sensations) ? init.sensations : [];
            this.positiveEmotions = Array.isArray(init.positiveEmotions) ? init.positiveEmotions : [];
            this.negativeEmotions = Array.isArray(init.negativeEmotions) ? init.negativeEmotions : [];
            this.needs = (init.needs && typeof init.needs === 'object') ? init.needs : {};
        }
    }
};
