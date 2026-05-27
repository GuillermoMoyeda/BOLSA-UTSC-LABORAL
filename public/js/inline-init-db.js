document.getElementById('initButton').addEventListener('click', async () => {
            const button = document.getElementById('initButton');
            const status = document.getElementById('status');

            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inicializando...';
            status.className = '';
            status.style.display = 'none';

            try {
                // Usuarios de prueba
                const usuarios = [
                    {
                        email: 'alumno@utsc.edu.mx',
                        password: await hashPassword('alumno123'),
                        nombre: 'Juan Pérez García',
                        rol: 'alumno',
                        carrera: 'Ingeniería en Sistemas Computacionales',
                        semestre: 6,
                        telefono: '5551234567',
                        fechaRegistro: new Date().toISOString()
                    },
                    {
                        email: 'admin@utsc.edu.mx',
                        password: await hashPassword('admin123'),
                        nombre: 'María González López',
                        rol: 'admin',
                        departamento: 'Administración',
                        telefono: '5559876543',
                        fechaRegistro: new Date().toISOString()
                    },
                    {
                        email: 'reclutador@empresa.com',
                        password: await hashPassword('reclutador123'),
                        nombre: 'Carlos Ramírez Sánchez',
                        rol: 'reclutador',
                        empresa: 'Tech Solutions SA de CV',
                        puesto: 'Gerente de Recursos Humanos',
                        telefono: '5555555555',
                        fechaRegistro: new Date().toISOString()
                    }
                ];

                // Crear usuarios en Firestore
                const batch = db.batch();

                for (const usuario of usuarios) {
                    // Verificar si el usuario ya existe
                    const existingUser = await db.collection('usuarios')
                        .where('email', '==', usuario.email)
                        .limit(1)
                        .get();

                    if (existingUser.empty) {
                        const userRef = db.collection('usuarios').doc();
                        batch.set(userRef, usuario);
                    }
                }

                await batch.commit();

                status.className = 'success';
                status.innerHTML = `
                    <strong>✅ ¡Base de datos inicializada correctamente!</strong><br><br>
                    Se han creado 3 usuarios de prueba. Ahora puedes iniciar sesión con cualquiera de ellos.
                `;

                button.innerHTML = '✓ Inicialización Completa';

            } catch (error) {
                console.error('Error:', error);
                status.className = 'error';
                status.innerHTML = `
                    <strong>❌ Error al inicializar la base de datos</strong><br>
                    ${error.message}
                `;

                button.disabled = false;
                button.innerHTML = 'Reintentar Inicialización';
            }
        });


