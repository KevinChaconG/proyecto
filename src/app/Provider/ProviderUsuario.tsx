'use client'
import React, { useContext, useState } from 'react'
import { PlantillaReact } from '../Modelos/PlantillaReact'
import { ContextUsuario } from '../Context/ContextUsuario'

export default function ProviderUsuario({ children }: PlantillaReact) {

    const [nombreUsuario, setNombreUsuario] = useState<string>('')

    return (
        <div>
            <ContextUsuario.Provider value={{ nombreUsuario, setNombreUsuario }}>
                {children}
            </ContextUsuario.Provider>
        </div>
    )
}

export const usuarioContext=() =>{
    return useContext(ContextUsuario)
}