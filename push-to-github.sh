#!/bin/bash

# Script para hacer push a GitHub con autenticación
# Ejecutar este script cuando estés listo para hacer push al repositorio remoto

echo "=== Script de push a GitHub para AbogadoWilson-new ==="
echo "Este script te ayudará a hacer push de los cambios al repositorio remoto"

# Verificar si hay cambios sin confirmar
if [[ -n $(git status -s) ]]; then
  echo "Hay cambios sin confirmar. Agregando todos los cambios..."
  git add .
  echo "Escriba un mensaje para el commit:"
  read -p "> " commit_message
  git commit -m "$commit_message"
fi

# Opciones para autenticación
echo ""
echo "Seleccione método de autenticación:"
echo "1) Token de acceso personal (PAT)"
echo "2) Nombre de usuario y contraseña"
echo "3) Usar SSH (si ya está configurado)"
read -p "Opción (1-3): " auth_option

case $auth_option in
  1)
    echo "Ingrese su nombre de usuario de GitHub:"
    read -p "> " github_user
    echo "Ingrese su token de acceso personal:"
    read -sp "> " github_token
    echo ""
    
    # Configurar el remote temporalmente con el token
    git remote set-url origin https://$github_user:$github_token@github.com/anipets12/abogadowilson-new.git
    git push origin main
    
    # Restaurar el remote original por seguridad
    git remote set-url origin https://github.com/anipets12/abogadowilson-new.git
    ;;
    
  2)
    # Usar el helper de credenciales
    echo "Se te pedirá tu nombre de usuario y contraseña de GitHub..."
    git push origin main
    ;;
    
  3)
    # Cambiar a SSH y hacer push
    echo "Cambiando a URL SSH para el remote..."
    git remote set-url origin git@github.com:anipets12/abogadowilson-new.git
    git push origin main
    
    # Preguntar si desea mantener la URL SSH
    echo ""
    read -p "¿Desea mantener la URL SSH para futuros push? (s/n): " keep_ssh
    if [[ $keep_ssh != "s" && $keep_ssh != "S" ]]; then
      git remote set-url origin https://github.com/anipets12/abogadowilson-new.git
      echo "Remote restaurado a HTTPS"
    else
      echo "Remote configurado permanentemente a SSH"
    fi
    ;;
    
  *)
    echo "Opción no válida"
    exit 1
    ;;
esac

echo ""
echo "=== Operación completada ==="
