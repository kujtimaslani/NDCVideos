//User roles
(function (exports) {

    var config = {

        roles: ['user','admin'],

    }
    exports.userRoles = buildRoles(config.roles);

    function buildRoles(roles) {

        var userRoles = {};

        for (var role in roles) {
            userRoles[roles[role]] = {
                title: roles[role]
            };
        }

        return userRoles;
    }

})(typeof exports === 'undefined' ? this['routingConfig'] = {} : exports);