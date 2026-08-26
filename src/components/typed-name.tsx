/**
 * La firma se escribe sola en la primera pintura: abre `<`, teclea el nombre y
 * cierra ` />`, con el cursor parpadeando en la posición de escritura y luego
 * esperando al final.
 *
 * Es CSS puro sobre fuente monoespaciada —donde `1ch` es exactamente un
 * carácter—, no JavaScript. Eso importa por dos razones: el texto empieza a
 * escribirse en el primer fotograma en vez de aparecer entero y borrarse al
 * hidratar, y sin JS sigue siendo un nombre legible.
 *
 * El cursor es un hermano fuera del recorte, no un borde: así sobrevive a
 * `prefers-reduced-motion` (parpadear no es moverse) y es el mismo `.caret`
 * que usa la consola.
 *
 * Los signos van marcados como decorativos: un lector de pantalla anuncia
 * «Sebastian Morales», no «menor que Sebastian Morales barra mayor que».
 */
export function TypedName({ name, className = '' }: { name: string; className?: string }) {
  const open = '<';
  const close = ' />';

  return (
    <span className={className ? `typed-wrap ${className}` : 'typed-wrap'}>
      <span
        className="typed"
        style={{ '--chars': open.length + name.length + close.length } as React.CSSProperties}
      >
        <span aria-hidden="true">{open}</span>
        {name}
        <span aria-hidden="true">{close}</span>
      </span>
      <span className="caret" aria-hidden="true" />
    </span>
  );
}
