/* ===================================================
   UBICATE - Backend Server
   Sirve la landing page y gestiona pre-registros
   Base de datos: Supabase (PostgreSQL)
   =================================================== */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== SUPABASE =====
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  SUPABASE_URL o SUPABASE_KEY no están configuradas.');
    console.warn('   El formulario no guardará datos hasta que las configures en .env');
}

let supabase = null;
try {
    if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) {
        supabase = createClient(supabaseUrl, supabaseKey);
    }
} catch (err) {
    console.warn('⚠️  No se pudo conectar a Supabase:', err.message);
}

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (HTML, CSS, JS, imágenes)
app.use(express.static(path.join(__dirname), {
    extensions: ['html']
}));

// ===== RUTAS API =====

// POST /api/registro - Recibir pre-registro
app.post('/api/registro', async (req, res) => {
    const { nombre, email, tipo, ciudad } = req.body;

    // Validación básica
    if (!nombre || !email || !tipo) {
        return res.status(400).json({
            success: false,
            message: 'Los campos nombre, email y tipo son obligatorios.'
        });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Por favor ingresa un correo electrónico válido.'
        });
    }

    // Validar tipo
    const tiposValidos = ['pasajero', 'conductor', 'ambos'];
    if (!tiposValidos.includes(tipo)) {
        return res.status(400).json({
            success: false,
            message: 'Tipo debe ser: pasajero, conductor o ambos.'
        });
    }

    // Verificar que Supabase está conectado
    if (!supabase) {
        return res.status(500).json({
            success: false,
            message: 'Base de datos no configurada. Contacta al administrador.'
        });
    }

    try {
        // Verificar si el email ya existe
        const { data: existente } = await supabase
            .from('registros')
            .select('email')
            .eq('email', email.trim().toLowerCase())
            .single();

        if (existente) {
            return res.status(409).json({
                success: false,
                message: 'Este correo ya está registrado. ¡Ya eres parte de UBICATE!'
            });
        }

        // Insertar nuevo registro
        const { data, error } = await supabase
            .from('registros')
            .insert([{
                nombre: nombre.trim(),
                email: email.trim().toLowerCase(),
                tipo,
                ciudad: ciudad ? ciudad.trim() : null
            }])
            .select();

        if (error) {
            console.error('❌ Error Supabase:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Hubo un error al registrarte. Intenta nuevamente.'
            });
        }

        console.log(`✅ Nuevo pre-registro: ${nombre.trim()} (${tipo}) - ${email.trim()}`);

        res.status(201).json({
            success: true,
            message: '¡Registro exitoso! Te avisaremos cuando UBICATE esté listo.',
            data: {
                nombre: nombre.trim(),
                tipo
            }
        });

    } catch (err) {
        console.error('❌ Error:', err.message);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor. Intenta nuevamente.'
        });
    }
});

// GET /api/registros - Ver todos los registros (protegido con clave)
app.get('/api/registros', async (req, res) => {
    const adminKey = req.headers['x-admin-key'] || req.query.key;

    if (adminKey !== process.env.ADMIN_KEY) {
        return res.status(401).json({
            success: false,
            message: 'Acceso no autorizado. Se requiere clave de administrador.'
        });
    }

    if (!supabase) {
        return res.status(500).json({ success: false, message: 'Base de datos no configurada.' });
    }

    try {
        const { data: registros, error } = await supabase
            .from('registros')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Estadísticas
        const stats = {
            total: registros.length,
            pasajeros: registros.filter(r => r.tipo === 'pasajero').length,
            conductores: registros.filter(r => r.tipo === 'conductor').length,
            ambos: registros.filter(r => r.tipo === 'ambos').length,
            ciudades: [...new Set(registros.map(r => r.ciudad).filter(Boolean))]
        };

        res.json({ success: true, stats, registros });

    } catch (err) {
        console.error('❌ Error:', err.message);
        res.status(500).json({ success: false, message: 'Error al obtener registros.' });
    }
});

// GET /api/stats - Estadísticas públicas (sin datos personales)
app.get('/api/stats', async (req, res) => {
    if (!supabase) {
        return res.json({ success: true, total_registros: 0, por_tipo: { pasajeros: 0, conductores: 0, ambos: 0 } });
    }

    try {
        const { data: registros, error } = await supabase
            .from('registros')
            .select('tipo');

        if (error) throw error;

        res.json({
            success: true,
            total_registros: registros.length,
            por_tipo: {
                pasajeros: registros.filter(r => r.tipo === 'pasajero').length,
                conductores: registros.filter(r => r.tipo === 'conductor').length,
                ambos: registros.filter(r => r.tipo === 'ambos').length
            }
        });

    } catch (err) {
        res.json({ success: true, total_registros: 0, por_tipo: { pasajeros: 0, conductores: 0, ambos: 0 } });
    }
});

// ===== RUTA PRINCIPAL =====
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ===== MANEJO DE ERRORES =====
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
});

// ===== INICIAR SERVIDOR =====
app.listen(PORT, () => {
    console.log('');
    console.log('🚀 ================================');
    console.log(`   UBICATE Server corriendo`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`   Supabase: ${supabase ? '✅ Conectado' : '❌ No configurado'}`);
    console.log('🚀 ================================');
    console.log('');
});
