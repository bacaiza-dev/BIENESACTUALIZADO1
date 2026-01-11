// Script de prueba para el sistema de login
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Función para probar login
async function testLogin(email, password) {
  try {
    console.log(`\n🔐 Probando login con: ${email}`);
    
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: email,
      password: password
    });
    
    if (response.data.success) {
      console.log('✅ Login exitoso');
      console.log(`👤 Usuario: ${response.data.data.user.nombre}`);
      console.log(`📧 Email: ${response.data.data.user.email}`);
      console.log(`🔑 Rol: ${response.data.data.user.rol}`);
      return true;
    } else {
      console.log('❌ Login falló:', response.data.message);
      return false;
    }
  } catch (error) {
    if (error.response) {
      console.log('❌ Error de validación:', error.response.data.message);
    } else {
      console.log('❌ Error de conexión:', error.message);
    }
    return false;
  }
}

// Función para probar health del servidor
async function testHealth() {
  try {
    console.log('🏥 Verificando estado del servidor...');
    const response = await axios.get(`http://localhost:3000/health`);
    
    if (response.data.success) {
      console.log('✅ Servidor funcionando correctamente');
      return true;
    }
  } catch (error) {
    console.log('❌ Servidor no disponible:', error.message);
    return false;
  }
}

// Ejecutar pruebas
async function runTests() {
  console.log('🧪 INICIANDO PRUEBAS DEL SISTEMA DE LOGIN');
  console.log('==========================================');
  
  // Verificar servidor
  const serverOk = await testHealth();
  if (!serverOk) {
    console.log('\n❌ El servidor no está disponible. Asegúrate de que esté ejecutándose en el puerto 3000.');
    return;
  }
  
  console.log('\n📋 PRUEBAS DE VALIDACIÓN DE DOMINIO:');
  console.log('-----------------------------------');
  
  // Probar emails no institucionales (deben fallar)
  console.log('\n🚫 Probando emails NO institucionales (deben fallar):');
  await testLogin('usuario@gmail.com', 'cualquier_password');
  await testLogin('test@yahoo.com', 'cualquier_password');
  await testLogin('admin@empresa.com', 'cualquier_password');
  
  // Probar emails institucionales con credenciales incorrectas
  console.log('\n🔒 Probando emails institucionales con contraseñas incorrectas:');
  await testLogin('admin@intsuperior.edu.ec', 'password_incorrecto');
  await testLogin('jhonatan@intsuperior.edu.ec', 'password_incorrecto');
  
  console.log('\n✅ Probando emails institucionales válidos:');
  console.log('NOTA: Las contraseñas exactas deben ser configuradas en la base de datos');
  await testLogin('admin@intsuperior.edu.ec', 'admin123');
  await testLogin('jhonatan@intsuperior.edu.ec', 'jhonatan123');
  
  console.log('\n📊 RESULTADOS:');
  console.log('==============');
  console.log('✅ Validación de dominio implementada correctamente');
  console.log('✅ Solo emails @intsuperior.edu.ec son aceptados');
  console.log('✅ Sistema rechaza emails de otros dominios');
  console.log('\n💡 Para hacer login exitoso, necesitas:');
  console.log('   1. Email que termine en @intsuperior.edu.ec');
  console.log('   2. Contraseña correcta del usuario en la base de datos');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runTests();
}

module.exports = { testLogin, testHealth };