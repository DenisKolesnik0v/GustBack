export class UserDto {
    id: string;
    email: string;
    username: string;
    isActivated: boolean;
    roles: string[];
    sex: string | null;
    aboutMe: string | null;
    city: string | null;
    country: { 
        name: string; 
        code: string; 
        flagUrl: string;
    } | null;

    constructor(user: any) {
        this.id = user.id;
        this.email = user.email;
        this.username = user.username;
        this.isActivated = user.isActivated;
        this.roles = user.roles;
        this.sex = user.profile?.sex || null;
        this.aboutMe = user.profile?.aboutMe || null;
        this.city = user.profile?.city || null;
        this.country = user.profile?.country ? {
            name: user.profile.country.name,
            code: user.profile.country.code,
            flagUrl: user.profile.country.flagUrl,
        } : null;
    }
}
