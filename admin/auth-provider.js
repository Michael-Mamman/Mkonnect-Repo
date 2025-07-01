import { DefaultAuthProvider } from 'adminjs';
import { componentLoader } from './component-loader.js';
import bcrypt from 'bcryptjs';
import AdminUser from '../models/admin.js';
const provider = new DefaultAuthProvider({
    componentLoader,
    authenticate: async ({ email, password }) => {
        const adminUser = await AdminUser.findOne({ email });
        if (adminUser) {
            const isPasswordValid = await bcrypt.compare(password, adminUser.password);
            if (isPasswordValid) {
                return { email: adminUser.email };
            }
        }
        return null;
    },
});
export default provider;
