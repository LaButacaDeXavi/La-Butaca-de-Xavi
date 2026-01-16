import crypto from "crypto"

// Datos del webhook real
const ts = "1768603349";
const requestId = "9230d67d-f079-4d54-b9aa-b3039917d108";
const paymentId = "141680823547";
const rawBody = `{"resource":"141680823547","topic":"payment"}`;
const expectedSignature = "38f8ccce4340522d528cb8c9d64c48fb08ad2fd09ca4c68a1b6b2f08c7aaa3a2";
const yourSecret = "8e153fba511943ce2bb34be69dda6fb7cf0d4d80b7ca2cbb00956141b2ca1d7a";

console.log("🔍 PROBANDO TODOS LOS FORMATOS POSIBLES\n");
console.log("Expected:", expectedSignature);
console.log("="  .repeat(80) + "\n");

const tests = [
    // Formato 1: Original con punto y coma
    {
        name: "Formato 1: id:X;request-id:Y;ts:Z;",
        manifest: `id:${paymentId};request-id:${requestId};ts:${ts};`
    },
    // Formato 2: Sin punto y coma final
    {
        name: "Formato 2: id:X;request-id:Y;ts:Z",
        manifest: `id:${paymentId};request-id:${requestId};ts:${ts}`
    },
    // Formato 3: Nuevo formato de MP
    {
        name: "Formato 3: ts.request-id.body",
        manifest: `${ts}.${requestId}.${rawBody}`
    },
    // Formato 4: URL encoded
    {
        name: "Formato 4: URL params",
        manifest: `id=${paymentId}&request-id=${requestId}&ts=${ts}`
    },
    // Formato 5: JSON
    {
        name: "Formato 5: JSON",
        manifest: JSON.stringify({ id: paymentId, "request-id": requestId, ts })
    },
    // Formato 6: Solo el body
    {
        name: "Formato 6: Solo body",
        manifest: rawBody
    },
    // Formato 7: ts + body
    {
        name: "Formato 7: ts + body",
        manifest: `${ts}${rawBody}`
    },
    // Formato 8: Variación del formato nuevo
    {
        name: "Formato 8: ts;request-id;body",
        manifest: `${ts};${requestId};${rawBody}`
    },
    // Formato 9: Con separador diferente
    {
        name: "Formato 9: id|request-id|ts",
        manifest: `id:${paymentId}|request-id:${requestId}|ts:${ts}`
    },
    // Formato 10: Orden diferente
    {
        name: "Formato 10: ts;id;request-id",
        manifest: `ts:${ts};id:${paymentId};request-id:${requestId};`
    },
    // Formato 11: Con resource en lugar de id
    {
        name: "Formato 11: resource en vez de id",
        manifest: `resource:${paymentId};request-id:${requestId};ts:${ts};`
    },
    // Formato 12: Con action
    {
        name: "Formato 12: action + id",
        manifest: `action:payment.updated;id:${paymentId};request-id:${requestId};ts:${ts};`
    },
    // Formato 13: Según docs viejas de MP
    {
        name: "Formato 13: ts + request-id + resource",
        manifest: `ts=${ts}&request-id=${requestId}&resource=${paymentId}`
    },
    // Formato 14: x-signature format
    {
        name: "Formato 14: ts,v1 format",
        manifest: `ts=${ts},v1=${expectedSignature}`
    },
    // Formato 15: dataID format
    {
        name: "Formato 15: dataID",
        manifest: `dataID=${paymentId}&requestID=${requestId}&ts=${ts}`
    }
];

let found = false;

tests.forEach((test, i) => {
    const signature = crypto.createHmac("sha256", yourSecret).update(test.manifest).digest("hex");
    const match = signature === expectedSignature;
    
    console.log(`${i + 1}. ${test.name}`);
    console.log(`   Manifest: ${test.manifest.substring(0, 80)}${test.manifest.length > 80 ? '...' : ''}`);
    console.log(`   Calculated: ${signature}`);
    console.log(`   ${match ? '✅ MATCH!' : '❌ No match'}`);
    console.log();
    
    if (match) {
        found = true;
        console.log("🎉 ENCONTRADO! El formato correcto es:");
        console.log(`   "${test.manifest}"`);
        console.log();
    }
});

if (!found) {
    console.log("❌ Ningún formato coincide.");
    console.log("\n💡 POSIBLES CAUSAS:");
    console.log("   1. El secret está mal (aunque lo sacaste del panel)");
    console.log("   2. MercadoPago está usando un formato no documentado");
    console.log("   3. Hay un encoding issue (UTF-8, etc)");
    console.log("   4. El payment ID está mal parseado");
    console.log("\n🔧 SIGUIENTE PASO:");
    console.log("   Contacta a soporte de MercadoPago o verifica:");
    console.log("   - Que sea el secret del webhook correcto (no del app)");
    console.log("   - Que el webhook esté en modo 'production' si usas credenciales de prod");
}