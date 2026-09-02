## Harness 

Un harness es simplemente una forma de organizar quién hace qué. No necesitáis infraestructura especial — podéis simular un harness con cuatro conversaciones separadas, cada una con el prompt de rol correcto. La separación de sesiones no es burocracia: elimina el sesgo contextual. Un agente que acaba de escribir el código tiene sesgo para revisarlo

Harness manual seria abrir diferentes chat con contexto limpio donde el resultado de un agente o chat se lo paso al otro.

Harness semiautomatico
    1 . TESTER -> DEVELOP -> TESTER  ( si ocurren mas de tres intento human in loop ) 

Harness automatico.

    1. PLAN -> TESTER -> DEVELOP -> QA -> DEV
    2 . TESTER -> DEVELOP -> TESTER ( deberiamos controlas el bucle, numero maximo de intentos etc )
