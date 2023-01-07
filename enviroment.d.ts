declare global {
    namespace NodeJS {
        interface ProcessEnv {
            MONGODB: string;
            KEY: string;
        }
    }
}

export {};
