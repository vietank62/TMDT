from drf_spectacular.extensions import OpenApiAuthenticationExtension


class FirebaseAuthenticationScheme(OpenApiAuthenticationExtension):
    target_class = "common.authentication.FirebaseAuthentication"
    name = "BearerAuth"

    def get_security_definition(self, auto_schema):
        return {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "Firebase ID Token",
            "description": (
                "Firebase ID token. "
                "Obtain via Firebase Auth REST API:\n\n"
                "POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword"
                "?key=YOUR_WEB_API_KEY\n\n"
                '{"email":"...","password":"...","returnSecureToken":true}\n\n'
                "Use the returned `idToken` value here."
            ),
        }
