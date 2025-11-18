import auth from './admin/auth.json';
import common from './common.json';
import admin from './admin/admin.json';

export const th = {
    "admin": {
        "auth": {
            ...auth
        },
        ...admin
    },
    "common": {
        ...common
    },
}