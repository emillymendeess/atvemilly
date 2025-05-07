// js/main.js
import { Garagem } from 'garagem.js';

document.addEventListener('DOMContentLoaded', () => {
    // Cria uma instância global da Garagem para ser acessível no console, se necessário para debug.
    // Em uma aplicação mais robusta, evitar globais é preferível.
    window.minhaGaragemApp = new Garagem(); 
    console.log("Aplicação Garagem Digital PRO++ inicializada.");
});