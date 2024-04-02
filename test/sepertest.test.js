import { expect } from 'chai';
import supertest from 'supertest';

const requester = supertest('http://localhost:3500');
let cookie;
let userID;

describe("Testing", () => {
    describe("Testing login and Session with Cookies:", () => {
        let mockUser;

        before(() => {
            mockUser = {
                first_name: "usuario de Prueba 2",
                last_name: "Apellido de prueba 2",
                email: "correodetest@gmail.com",
                password: "123456",
            };
        });

        it("Registro de usuario debe poder Registrar correctamente al usuario", async () => {
            const { statusCode } = await requester.post("/api/sessions/register").send(mockUser);
            expect(statusCode).to.eql(201);
        });

        it("Login debe poder Loguear al usuario registrado Previamente", async () => {
            const mockLogin = {
                email: mockUser.email,
                password: mockUser.password
            };

            const result = await requester.post("/api/jwt/login").send(mockLogin);
            expect(result.status).to.eql(200);

            const cookieResult = result.headers['set-cookie'][0];
            const cookieData = cookieResult.split("=");
            cookie = {
                name: cookieData[0],
                value: cookieData[1]
            };
            expect(cookie.name).to.eql('jwtCookieToken');
        });

        it("Obtener los datos del Usuario por medio de la ruta Current", async () => {
            const response = await requester.get("/api/sessions/current").set('cookie', `${cookie.name}=${cookie.value}`);
            expect(response.status).to.eql(200);
            userID = response.body.payload.user._id;
        });

        it("Intercambia el rol del Usuario a Premium y Actualiza la cookie ", async () => {
            // Realizar la solicitud para cambiar el rol del usuario a "premium"
            const responseChangeRole = await requester.put(`/users/${userID}`);

            // Verificar que la solicitud de cambio de rol fue exitosa
            expect(responseChangeRole.status).to.eql(200);

            // Realizar la solicitud de inicio de sesión nuevamente para obtener un nuevo token con el rol actualizado
            const responseLogin = await requester.post("/api/jwt/login").send({
                email: mockUser.email,
                password: mockUser.password
            });

            // Verificar que el inicio de sesión fue exitoso
            expect(responseLogin.status).to.eql(200);

            // Obtener el nuevo token del encabezado de la respuesta
            const newToken = responseLogin.headers['set-cookie'][0].split('=')[1];

            // Actualizar la cookie para utilizar el nuevo token en pruebas posteriores
            cookie = {
                name: 'jwtCookieToken',
                value: newToken
            };
        });

    });
    describe("Testing Products:", () => {
        let newProductID;

        it("Agregar un nuevo producto debe ser exitoso", async () => {
            // Datos del producto a agregar
            const newProductData = {
                title: "Nuevo Producto",
                description: "Descripción del nuevo producto",
                price: 10.99,
                thumbnails: ["imagen1.jpg", "imagen2.jpg"],
                code: "NP001",
                stock: 100,
                status: true
            };

            // Realizar la solicitud para agregar un nuevo producto
            const response = await requester
                .post("/api/product/")
                .set('cookie', `${cookie.name}=${cookie.value}`)
                .send(newProductData);

            // Verificar el código de estado y la estructura de la respuesta
            expect(response.status).to.eql(201);
            expect(response.body.status).to.eql('success');
            expect(response.body.data).to.be.an('object');
            expect(response.body.data).to.have.property('_id');
            expect(response.body.data.title).to.eql(newProductData.title);

            // Guardar el ID del nuevo producto para usarlo en pruebas posteriores
            newProductID = response.body.data._id;
            // console.log("ID del Producto " + newProductID );
        });


        it("Debería devolver un array de productos cuando el usuario tiene un rol válido", async () => {
            // Realizar la solicitud para obtener todos los productos con la cookie válida
            const response = await requester
                .get("/api/product/products")
                .set('cookie', `${cookie.name}=${cookie.value}`);

            // Verificar que la solicitud fue exitosa y devolvió un array de productos
            expect(response.status).to.eql(200);
            expect(response.body).to.be.an('array');
        });

        it("Borrar el producto que se agrego al inicio", async () => {
            const response = await requester
                .delete(`/api/product/${newProductID}`)
                .set('cookie', `${cookie.name}=${cookie.value}`);

            expect(response.status).to.equal(200);
        })
        // Puedes agregar más pruebas aquí para probar otros aspectos relacionados con productos, como actualizar o eliminar un producto
    });
    describe("Operaciones de carrito y tickets:", () => {
        it("Debería poder agregar un producto al carrito", async () => {
            const ProductoCarritoMockID = "660c286f0e41a2ab51d1a93e" //Hardcodeado T_T
            const response = await requester
                .post(`/api/carts/${ProductoCarritoMockID}`)
                .set('cookie', `${cookie.name}=${cookie.value}`);
            expect(response.status).to.equal(200)
        });

        it("Debería poder Eliminar un producto del carrito", async () => {
            const ProductoCarritoMockID = "660c286f0e41a2ab51d1a93e" //Hardcodeado T_T
            const response = await requester
                .delete(`/api/carts/${ProductoCarritoMockID}`)
                .set('cookie', `${cookie.name}=${cookie.value}`);
            expect(response.status).to.equal(200)
        });

        it("Debería poder Generar un ticket al usuario y vaciar el carrito", async function () {
            this.timeout(5000); // Aumenta el tiempo de espera a 5000ms

            // Agregamos un producto al carrito para poder realizar el ticket
            const ProductoCarritoMockID = "660c286f0e41a2ab51d1a93e"; // Hardcodeado T_T
            const AgregarProducto = await requester
                .post(`/api/carts/${ProductoCarritoMockID}`)
                .set('cookie', `${cookie.name}=${cookie.value}`);

            // Intentamos realizar el ticket   
            const response = await requester
                .post(`/api/carts/tickets/create`)
                .set('cookie', `${cookie.name}=${cookie.value}`);

            // Verificar que se haya creado el ticket correctamente
            expect(response.status).to.equal(201);
        });

    });


});
