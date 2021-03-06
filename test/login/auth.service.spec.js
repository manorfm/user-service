const expect = require('chai').expect;
const sinon = require("sinon");
require('sinon-mongoose');

const User = require('../../api/user/user');
const authService = require('../../api/login/authService')

class ResponseMock {
    send(obj) {
        return this
    }
    status(value) {
        return this
    }
}

describe('Testing private _validate of auth.service', () => {
    it('Validate field cannot be undefined', () => {
        let value = undefined
        const errors = []
        const next = sinon.stub()
        authService._validate(value, 'Field cannot be undefined', errors, next)

        expect(errors).to.be.not.empty
        expect(errors).to.be.length(1)
        expect(errors).to.include('Field cannot be undefined')
        expect(next.called).to.be.false
    })
    it('Validate field cannot be null', () => {
        let value = null
        const errors = []
        const next = sinon.stub()
        authService._validate(value, 'Field cannot be null', errors, next)
        
        expect(errors).to.be.not.empty
        expect(errors).to.be.length(1)
        expect(errors).to.include('Field cannot be null')
        expect(next.called).to.be.false
    })
    it('Validate field cannot be empty', () => {
        let value = ''
        const errors = []
        const next = sinon.stub()
        authService._validate(value, 'Field cannot be empty', errors, next)
        
        expect(errors).to.be.not.empty
        expect(errors).to.be.length(1)
        expect(errors).to.include('Field cannot be empty')
        expect(next.called).to.be.false
    })
    it('Validate field different of empty', () => {
        let value = 'not empty anymore'
        const errors = []
        const next = sinon.stub()
        authService._validate(value, 'Field cannot be empty', errors, next)
        
        expect(errors).to.be.empty
        expect(next.called).to.be.true

        var errorsAsArgToNextFuction = next.getCall(0).args[0];
        expect(errorsAsArgToNextFuction).to.be.eq(errors)
    })
    it('Validate field different of empty and errors with some field', () => {
        let value = 'not empty anymore'
        const errors = ['Other fieald had a error']
        const next = sinon.stub()
        authService._validate(value, 'Field cannot be empty', errors, next)
        
        expect(errors).to.be.not.empty
        expect(errors).to.be.length(1)
        expect(next.called).to.be.true
        
        var errorsAsArgToNextFuction = next.getCall(0).args[0];
        expect(errorsAsArgToNextFuction).to.be.eq(errors)
    })
    it('Validate field different without next', () => {
        let value = 'not empty anymore'
        const errors = ['Other fieald had a error']
        authService._validate(value, 'Field cannot be empty', errors)
        
        expect(errors).to.be.not.empty
        expect(errors).to.be.length(1)
    })
    it('Validate field different without next', () => {
        let value = 'not empty anymore'
        const errors = ['Other fieald had a error']
        authService._validate(value, 'Field cannot be empty', errors)
        
        expect(errors).to.be.not.empty
        expect(errors).to.be.length(1)
    })
    it('Validate field is a number', () => {
        let value = 1234
        const errors = []
        authService._validate(value, 'Field cannot be empty', errors)
        
        expect(errors).to.be.empty
    })
})

describe('Testing private _validateFields of auth.service', () => {
    it('Should not be undefined the fields name, email and password', () => {
        const name = undefined
        const email = undefined
        const password = undefined
        
        const errors = {
            errors: [
              "O campo 'Nome' não pode ser vazio",
              "O campo 'E-mail' não pode ser vazio",
              "O campo 'Senha' não pode ser vazio"
            ]
          }
          
          try {
            authService._validateFields(name, email, password)
          } catch (err) {
              expect(err).to.deep.include(errors)
          }
    })
    it('Should the password have at less one character lowcase, uppercase, number, special character and of 8 to 12 caracteres', () => {
        const name = 'test'
        const email = 'test@test.com'
        const password = 'test'
        
        const errors = {
            errors: [
                "Senha precisa ter: uma letra maiúscula, uma letra minúscula, um número, um caracter especial e de 8 a 12 caracteres"
            ]
          }
          
          try {
            authService._validateFields(name, email, password)
          } catch (err) {
              expect(err).to.deep.include(errors)
          }
    })
    it('Should the email be a valid one', () => {
        const name = 'test'
        const email = 'test'
        const password = 'P@ssword1'
        
        const errors = {
            errors: [
                "O e-mail é inválido"
            ]
          }
          
          try {
            authService._validateFields(name, email, password)
          } catch (err) {
              expect(err).to.deep.include(errors)
          }
    })
    it('Should combine the erros from email must be a valid one and name cannot be empty', () => {
        const name = ''
        const email = 'test'
        const password = 'P@ssword1'
        
        const errors = {
            errors: [
                "O campo 'Nome' não pode ser vazio",
                "O e-mail é inválido"
            ]
          }
          
          try {
            authService._validateFields(name, email, password)
          } catch (err) {
              expect(err).to.deep.include(errors)
          }
    })
    it('Should combine the erros from password must be a valid one and name cannot be empty', () => {
        const name = ''
        const email = 'test@test.com'
        const password = 'test'
        
        const errors = {
            errors: [
                "O campo 'Nome' não pode ser vazio",
                "Senha precisa ter: uma letra maiúscula, uma letra minúscula, um número, um caracter especial e de 8 a 12 caracteres"
            ]
          }
          
          try {
            authService._validateFields(name, email, password)
          } catch (err) {
              expect(err).to.deep.include(errors)
          }
    })
})

describe('Test the regexes to validate email', () => {
    it('Should not be empty', () => {
        const erroMessage = 'value cannot be empty'
        const validate = authService._validateByRegex('', authService.EMAIL_REGEX, erroMessage)
        const errors = []
       
        validate(errors)
       
        expect(errors).to.have.lengthOf(1)
        expect(errors).to.deep.equal([erroMessage])
    })
    it('Should not be without @', () => {
        const erroMessage = 'value cannot be without @'
        const validate = authService._validateByRegex('teste.com', authService.EMAIL_REGEX, erroMessage)
        const errors = []
        
        validate(errors)
        
        expect(errors).to.have.lengthOf(1)
        expect(errors).to.deep.equal([erroMessage])
    })
    it('Should be at least be like xxxx@doman.somehting', () => {
        const erroMessage = 'the value should have xxxx@doman.somehting'
        const validate = authService._validateByRegex('teste@test.com', authService.EMAIL_REGEX, erroMessage)
        const errors = []
        
        validate(errors)
        
        expect(errors).to.be.empty
    })
})

describe('Test the regexes to validate password', () => {
    it('Should not be empty', () => {
        const erroMessage = 'password cannot be emnpty'
        const validate = authService._validateByRegex('', authService.PASSWORD_REGEX, erroMessage)
        const errors = []
       
        validate(errors)
       
        expect(errors).to.have.lengthOf(1)
        expect(errors).to.deep.equal([erroMessage])
    })
    it('Should have at least one lowercase character', () => {
        const erroMessage = 'must have at last one lowercase character'
        const validate = authService._validateByRegex('P@SSWORD1', authService.PASSWORD_REGEX, erroMessage)
        const errors = []
        
        validate(errors)
        
        expect(errors).to.have.lengthOf(1)
        expect(errors).to.deep.equal([erroMessage])
    })
    it('Should have at least one uppercase character', () => {
        const erroMessage = 'must have at last one uppercase character'
        const validate = authService._validateByRegex('p@ssword1', authService.PASSWORD_REGEX, erroMessage)
        const errors = []
        
        validate(errors)
        
        expect(errors).to.have.lengthOf(1)
        expect(errors).to.deep.equal([erroMessage])
    })
    it('Should have at least one numeral character', () => {
        const erroMessage = 'must have at last one numeral character'
        const validate = authService._validateByRegex('p@ssword', authService.PASSWORD_REGEX, erroMessage)
        const errors = []
        
        validate(errors)
        
        expect(errors).to.have.lengthOf(1)
        expect(errors).to.deep.equal([erroMessage])
    })
    it('Should have at least one special character', () => {
        const erroMessage = 'must have at last one special character'
        const validate = authService._validateByRegex('Passwor1', authService.PASSWORD_REGEX, erroMessage)
        const errors = []
        
        validate(errors)
        
        expect(errors).to.have.lengthOf(1)
        expect(errors).to.deep.equal([erroMessage])
    })
    it('Should to pass with all aggreements accomplished', () => {
        const validate = authService._validateByRegex('P@ssword1', authService.PASSWORD_REGEX)
        const errors = []
        
        validate(errors)
        
        expect(errors).to.be.empty
    })
})

describe('Testing signup', () => {
    it('Should check if the user already exists', () => {
        const res = new ResponseMock()
        const statusSpy = sinon.spy(res, 'status')
        const sendSpy = sinon.spy(res, 'send')
        
        const userMock = sinon.mock(User)

        userMock.expects('findOne')
            .once()
            .withArgs({email: "email@test.com"})
            .chain('exec')
            .yields(null, {nome: "Test"})
        
        authService.signup(_getReqMockFullParameters(), res)
        
        expect(res.status.calledOnce).to.be.true;
        expect(res.send.calledOnce).to.be.true;
        
        sinon.assert.calledWith(statusSpy, 412);
        sinon.assert.calledWith(sendSpy, { errors: ['Usuário já cadastrado'] });
        
        userMock.verify()
        userMock.restore()
    });
});

const _getReqMockFullParameters = () => ({ "body": { nome: "test", email: "email@test.com", senha: "P@ssword1"}})