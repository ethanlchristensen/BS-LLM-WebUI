export type BaseEntity = {
    id: string;
    createdAt: string;
};

export type Entity<T> = {
    [K in keyof T]: T[K];
} & BaseEntity;


export type UserMessage = Entity<{
    conversation: string;
    content: string;
    image: string | null;
    type: string;
}>;

export type AssistantMessage = Entity<{
    conversation: string;
    content: string;
    model: BaseModelEntity;
    provider: string;
    liked: boolean;
    type: string
}>;

export type AuthResponse = {
    token: string;
    expiry: number;
};

export type Conversation = Entity<{
    title: string;
    user: string;
    updatedAt: number;
    liked: boolean;
}>;

export type ConversationDetailMessage = Entity<
| {
    content: string;
    type: string;
    model: BaseModelEntity;
    provider: string;
    liked: boolean;
} 
| {
    content: string;
    type: string;
    image: string | null;
}>;

export type ConversationDetail = {
    title: string;
    user: string;
    updatedAt: number;
    liked: boolean;
    messages: ConversationDetailMessage[];
};

export type BaseModelEntity = {
    id: number;
    name: string;
    model: string;
    liked: boolean;
    color: 'gray' | 'gold' | 'bronze' | 'brown' | 'yellow' | 'amber' | 'orange' | 'tomato' | 'red' | 'ruby' | 'crimson' | 'pink' | 'plum' | 'purple' | 'violet' | 'iris' | 'indigo' | 'blue' | 'cyan' | 'teal' | 'jade' | 'green' | 'grass' | 'lime' | 'mint' | 'sky';
};

export type ModelEntity<T> = {
    [K in keyof T]: T[K];
} & BaseModelEntity;

export type ModelDetails = {
    license: string;
    modelfile: string;
    parameters: string;
    template: string;
    system: string;
    modified_at: string;
}


export type ModelDetail = ModelEntity<{
    details: ModelDetails
}>;


export type GenerateConversationTitle = {
    generatedTitle: string;
}

export type Profile = {
    "image": string,
    "bio": string,
    "preferred_model": BaseModelEntity,
}

export type UserProfile = {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    profile: Profile;
}


