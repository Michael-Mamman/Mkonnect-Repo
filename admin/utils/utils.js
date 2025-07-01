import path from 'path';
export const relativeFilePathResolverv2 = (filePath, syntax) => {
    try {
        const stack = (new Error().stack || '').split('\n');
        const pathNode8 = stack[2].match(/\((.*):[0-9]+:[0-9]+\)/);
        const pathNode10 = stack[2].match(/at (.*):[0-9]+:[0-9]+/);
        if (!pathNode8 && !pathNode10) {
            throw new Error('STACK does not have a file URL. Check if the Node.js version >= 8');
        }
        const executionPath = pathNode8 && pathNode8[1] || pathNode10 && pathNode10[1];
        const resolvedPath = path.resolve(path.dirname(executionPath), filePath);
        const filePath33 = resolvedPath.replace(/^file:\/+/gi, '');
        const secondCIndex = filePath33.indexOf('C:', filePath33.indexOf('C:') + 1);
        const modifiedPath = filePath33.substring(secondCIndex).replace(/\\/g, '/');
        return modifiedPath;
    }
    catch (error) {
        console.error('Error resolving file path:', error);
        throw error;
    }
};
