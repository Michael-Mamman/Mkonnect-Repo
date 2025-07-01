import dotenv from 'dotenv';
import { ComponentLoader } from 'adminjs';
import { relativeFilePathResolverv2 } from './utils/utils.js';
dotenv.config();

const env = process.env.NODE_ENV
const componentLoader = new ComponentLoader();
const dash = relativeFilePathResolverv2('./dashboard.js', new RegExp(`..{1}${'add'}`));
const sidebar = relativeFilePathResolverv2('./sidebar.js', new RegExp(`..{1}${'override'}`));
const login = relativeFilePathResolverv2('./login.js', new RegExp(`..{1}${'override'}`));
const msg = relativeFilePathResolverv2('./msg.js', new RegExp(`..{1}${'add'}`));


let Components;
// if(process.env.NODE_ENV === 'production'){
//  Components = {
//     Dashboard: componentLoader.add('Dashboard', './dashboard.js'),
//     Sidebar: componentLoader.override('Sidebar', './sidebar.js'),
//     Login: componentLoader.override('Login', './login.js'),
//     Msg: componentLoader.add('Msg', './msg.js')

// };}else{
 Components = {
    Dashboard: componentLoader.add('Dashboard', dash),
    Sidebar: componentLoader.override('Sidebar', sidebar),
    Login: componentLoader.override('Login', login),
    Msg: componentLoader.add('Msg', msg),
 }
// }

export { componentLoader, Components };
