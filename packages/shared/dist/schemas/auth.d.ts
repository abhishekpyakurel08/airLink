export declare const UserPlanEnum: any;
export declare const UserSchema: any;
export declare const DeviceTypeEnum: any;
export declare const DeviceSchema: any;
export type User = z.infer<typeof UserSchema>;
export type Device = z.infer<typeof DeviceSchema>;
