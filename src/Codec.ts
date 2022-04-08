/**
 * **This module is experimental**
 *
 * Experimental features are published in order to get early feedback from the community, see these tracking
 * [issues](https://github.com/gcanti/io-ts/issues?q=label%3Av2.2+) for further discussions and enhancements.
 *
 * A feature tagged as _Experimental_ is in a high state of flux, you're at risk of it changing without notice.
 *
 * @since 2.2.3
 */
import { pipe } from 'fp-ts/lib/pipeable'
import * as D from './poc'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

export interface Codec<D, E> {
  readonly decoder: D
  readonly encoder: E
}

export const codec = <D extends D.AnyD, E extends D.AnyD>(decoder: D, encoder: E): Codec<D, E> => ({
  decoder,
  encoder
})

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

export const string = codec(D.string, D.id<string>())

// -------------------------------------------------------------------------------------
// composition
// -------------------------------------------------------------------------------------

export const compose = <PD extends D.AnyD, ND extends D.Decoder<D.TypeOf<PD>, any, any>, NE extends D.AnyD>(
  next: Codec<ND, NE>
) => <PE extends D.Decoder<D.TypeOf<NE>, any, any>>(
  prev: Codec<PD, PE>
): Codec<D.CompositionD<PD, ND>, D.CompositionD<NE, PE>> =>
  codec(pipe(prev.decoder, D.compose(next.decoder)), pipe(next.encoder, D.compose(prev.encoder)))

// -------------------------------------------------------------------------------------
// examples
// -------------------------------------------------------------------------------------

export interface NumberFromStringD extends D.Decoder<string, never, number> {}
const NumberFromStringD: NumberFromStringD = {
  decode: (s: string) => D.success(parseFloat(s))
}
export interface StringFromNumberD extends D.Decoder<number, never, string> {}
const StringFromNumberD: StringFromNumberD = {
  decode: (n: number) => D.success(String(n))
}

const NumberFromStringC = codec(NumberFromStringD, StringFromNumberD)

export const NumberFromString = pipe(string, compose(NumberFromStringC))
