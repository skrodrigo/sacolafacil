import { Context, Handler } from 'hono';
import { HTTPException } from 'hono/http-exception';

/**
 * Simplifica a criação de controllers, abstraindo o tratamento de erros e a formatação da resposta.
 */
export function controller<T extends Handler>(callback: T): T {
  const wrappedCallback = async (c: Context, ...args: any[]) => {
    try {
      // @ts-ignore
      const result = await callback(c, ...args);

      if (result instanceof Response) {
        return result;
      }

      // O zod-openapi espera o retorno direto do JSON, sem o wrapper { success: true, data: ... }
      return c.json(result);

    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      console.error('Controller error:', error);
      throw new HTTPException(500, { message: 'INTERNAL_SERVER_ERROR' });
    }
  };

  return wrappedCallback as T;
}
