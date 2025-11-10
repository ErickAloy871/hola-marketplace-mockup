import { useState, useEffect } from "react";
export var useAuth = function () {
    var _a = useState(null), user = _a[0], setUser = _a[1];
    var _b = useState(true), loading = _b[0], setLoading = _b[1]; // Indica si se está cargando la autenticación
    useEffect(function () {
        checkAuth();
    }, []);
    var checkAuth = function () {
        var token = localStorage.getItem("token");
        var userStr = localStorage.getItem("user");
        if (token && userStr) {
            try {
                var userData = JSON.parse(userStr);
                setUser(userData);
            }
            catch (error) {
                console.error("Error parsing user data:", error);
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            }
        }
        setLoading(false);
    };
    var login = function (token, userData) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
    };
    var logout = function () {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };
    return {
        user: user,
        loading: loading, // Estado para indicar carga
        isAuthenticated: !!user,
        login: login,
        logout: logout,
        checkAuth: checkAuth,
    };
};
