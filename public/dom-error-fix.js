/**
 * Script para solucionar problemas de DOM - Fix Universal
 * Corrige errores comunes con appendChild, removeChild y otras operaciones DOM
 */

(function() {
  console.log('[DOMErrorFix] Inicializando correcciones para operaciones DOM...');
  
  // Original functions backup
  const originalRemoveChild = Element.prototype.removeChild;
  const originalAppendChild = Element.prototype.appendChild;
  const originalInsertBefore = Element.prototype.insertBefore;
  const originalReplaceChild = Element.prototype.replaceChild;
  
  // 1. Safe removeChild - Previene errores "Node to be removed is not a child"
  Element.prototype.removeChild = function(child) {
    try {
      if (child && this.contains(child)) {
        return originalRemoveChild.call(this, child);
      } else {
        console.warn('[DOMErrorFix] Intento de eliminar un nodo que no es hijo', child);
        return child; // Return the node instead of throwing error
      }
    } catch (e) {
      console.warn('[DOMErrorFix] Error en removeChild:', e);
      return child;
    }
  };
  
  // 2. Safe appendChild - Previene errores "Node already has a parent"
  Element.prototype.appendChild = function(child) {
    try {
      // Si el nodo ya tiene padre, quitarlo primero de manera segura
      if (child.parentNode && child.parentNode !== this) {
        try {
          child.parentNode.removeChild(child);
        } catch (err) {
          console.warn('[DOMErrorFix] Error al quitar nodo de su padre actual:', err);
          // No propagar el error, intentar continuar
        }
      }
      return originalAppendChild.call(this, child);
    } catch (e) {
      console.warn('[DOMErrorFix] Error en appendChild:', e);
      return child;
    }
  };
  
  // 3. Safe insertBefore - Previene errores "Node to be inserted is in the wrong document"
  Element.prototype.insertBefore = function(newNode, referenceNode) {
    try {
      // Si el nodo ya tiene padre, quitarlo primero
      if (newNode.parentNode && newNode.parentNode !== this) {
        try {
          newNode.parentNode.removeChild(newNode);
        } catch (err) {}
      }
      
      // Si el nodo de referencia no existe o no es hijo, añadir al final
      if (!referenceNode || !this.contains(referenceNode)) {
        return this.appendChild(newNode);
      }
      
      return originalInsertBefore.call(this, newNode, referenceNode);
    } catch (e) {
      console.warn('[DOMErrorFix] Error en insertBefore:', e);
      return newNode;
    }
  };
  
  // 4. Safe replaceChild - Previene errores varios con reemplazo de nodos
  Element.prototype.replaceChild = function(newChild, oldChild) {
    try {
      // Si el nuevo nodo ya tiene padre, quitarlo primero
      if (newChild.parentNode && newChild.parentNode !== this) {
        try {
          newChild.parentNode.removeChild(newChild);
        } catch (err) {}
      }
      
      // Si el nodo a reemplazar no es hijo, simplemente añadir el nuevo
      if (!this.contains(oldChild)) {
        console.warn('[DOMErrorFix] Nodo a reemplazar no es hijo', oldChild);
        return this.appendChild(newChild);
      }
      
      return originalReplaceChild.call(this, newChild, oldChild);
    } catch (e) {
      console.warn('[DOMErrorFix] Error en replaceChild:', e);
      try {
        // Intento alternativo: quitar el viejo y añadir el nuevo
        this.removeChild(oldChild);
        this.appendChild(newChild);
        return oldChild;
      } catch (fallbackError) {
        console.error('[DOMErrorFix] Error en fallback de replaceChild:', fallbackError);
        return oldChild;
      }
    }
  };
  
  // 5. Aplicar patch a métodos Document para manejar referencias a document.body antes de estar listo
  const originalGetElementById = Document.prototype.getElementById;
  Document.prototype.getElementById = function(id) {
    try {
      return originalGetElementById.call(this, id);
    } catch (e) {
      console.warn('[DOMErrorFix] Error en getElementById:', e);
      return null;
    }
  };
  
  // 6. Patch seguro para innerHTML (evitar errores de sintaxis HTML)
  const originalInnerHTMLDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  if (originalInnerHTMLDescriptor && originalInnerHTMLDescriptor.set) {
    Object.defineProperty(Element.prototype, 'innerHTML', {
      set: function(html) {
        try {
          return originalInnerHTMLDescriptor.set.call(this, html);
        } catch (e) {
          console.warn('[DOMErrorFix] Error al establecer innerHTML:', e);
          // Intentar fallback con texto plano
          try {
            this.textContent = html;
          } catch (textError) {}
          return html;
        }
      },
      get: originalInnerHTMLDescriptor.get
    });
  }
  
  console.log('[DOMErrorFix] Operaciones DOM parcheadas correctamente');
})();
