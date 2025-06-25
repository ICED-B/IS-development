from marshmallow import Schema, fields

class LoginSchema(Schema):
    login = fields.Str(required=True)
    heslo = fields.Str(required=True)
