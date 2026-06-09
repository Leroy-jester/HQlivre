import { useState } from "react"
function name() {
    
    const [manga, setManga]=useState('')
    return(
    <div>
        
    <p>
      {manga.generos.map(g => g.nome_genero).join(', ')}
    </p>
    </div>
    )
}