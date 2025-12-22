export function Footer() {
    return (
        <footer className="bg-card border-t border-border mt-16">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="font-bold text-foreground mb-4">La Butaca de Xavi</h3>
                        <p className="text-sm text-muted-foreground">
                            Tu plataforma de venta de entradas de teatro en Argentina.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Enlaces</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>Cartelera</li>
                            <li>Teatros</li>
                            <li>Ayuda</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>Términos y condiciones</li>
                            <li>Política de privacidad</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Contacto</h4>
                        <p className="text-sm text-muted-foreground">info@labutacadexavi.com</p>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
                    © {new Date().toISOString().slice(0,4)} La Butaca de Xavi. Todos los derechos reservados.
                </div>
            </div>
        </footer>
    )
}