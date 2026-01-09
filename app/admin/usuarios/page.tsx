import UserPage from "./usuarios";
import { getUsers } from "./actions";

export const dynamic = "force-dynamic";

export default async function page() {
    let users: any;
    try {
        
        const data = await getUsers();
    
        if (data) users = data.users || [];
    } catch (error) {
        
    }

    return <UserPage users={users} />
}