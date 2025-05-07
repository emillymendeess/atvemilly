// js/Caminhao.js
import { Carro } from 'carro.js';

/**
 * @class Caminhao
 * @extends Carro
 * @classdesc Representa um caminhão, com capacidade de carga.
 * Herda de Carro para reutilizar lógica de movimento, mas ajusta aceleração.
 */
export class Caminhao extends Carro {
    /**
     * Cria uma instância de Caminhao.
     * @param {string} modelo - O modelo do caminhão.
     * @param {string} cor - A cor do caminhão.
     * @param {number} capacidadeCarga - A capacidade máxima de carga do caminhão em kg.
     */
    constructor(modelo, cor, capacidadeCarga) {
        super(modelo, cor);
        /** @property {number} capacidadeCarga - A capacidade máxima de carga em kg. */
        this.capacidadeCarga = capacidadeCarga;
        /** @property {number} cargaAtual - A carga atual do caminhão em kg. */
        this.cargaAtual = 0;
        this.imagemUrl = "images/caminhao.png";
        this.velocidadeMaxima = 140; // Caminhões são mais lentos

        // Sons específicos
        this.audioBuzina = new Audio('audio/buzina_caminhao_som.mp3');
        // Reutiliza sons de acelerar/frear de Carro ou pode ter os seus próprios
    }

    /**
     * Carrega o caminhão com um determinado peso.
     * O caminhão deve estar desligado para carregar.
     * Não permite exceder a capacidade de carga.
     * @param {number} peso - O peso a ser carregado em kg.
     * @returns {string} Mensagem indicando o resultado da ação.
     */
    carregar(peso) {
        if (this.ligado) {
            this._playSound(this.audioErro);
            return "Desligue o caminhão para carregar/descarregar.";
        }
        if (peso <= 0) {
            this._playSound(this.audioErro);
            return "O peso para carregar deve ser positivo.";
        }
        if (this.cargaAtual + peso <= this.capacidadeCarga) {
            this.cargaAtual += peso;
            return `${this.modelo} carregado com ${peso}kg. Carga total: ${this.cargaAtual}kg.`;
        }
        this._playSound(this.audioErro);
        const podeCarregar = this.capacidadeCarga - this.cargaAtual;
        return `Capacidade de carga (${this.capacidadeCarga}kg) excedida. Você pode carregar mais ${podeCarregar}kg.`;
    }

    /**
     * Descarrega um determinado peso do caminhão.
     * O caminhão deve estar desligado para descarregar.
     * Não permite descarregar mais do que a carga atual.
     * @param {number} peso - O peso a ser descarregado em kg.
     * @returns {string} Mensagem indicando o resultado da ação.
     */
    descarregar(peso) {
        if (this.ligado) {
            this._playSound(this.audioErro);
            return "Desligue o caminhão para carregar/descarregar.";
        }
        if (peso <= 0) {
            this._playSound(this.audioErro);
            return "O peso para descarregar deve ser positivo.";
        }
        if (this.cargaAtual - peso >= 0) {
            this.cargaAtual -= peso;
            return `${this.modelo} descarregou ${peso}kg. Carga restante: ${this.cargaAtual}kg.`;
        }
        this._playSound(this.audioErro);
        return `Não é possível descarregar ${peso}kg. Carga atual: ${this.cargaAtual}kg.`;
    }

    /**
     * Acelera o caminhão.
     * A aceleração é afetada pela carga atual (fator de carga).
     * @param {number} [incrementoBase=8] - O incremento base de velocidade.
     * @returns {string} Mensagem indicando o resultado da ação.
     */
    acelerar(incrementoBase = 8) {
        if (!this.ligado) {
            this._playSound(this.audioErro);
            return `${this.modelo} está desligado. Não pode acelerar.`;
        }

        // Fator de carga: 1.0 (vazio) a ~0.1 (muito carregado)
        // Evita divisão por zero se capacidadeCarga for 0 e ajusta impacto
        const fatorCarga = Math.max(0.1, 1 - (this.cargaAtual / (this.capacidadeCarga * 1.1)));
        const aceleracaoEfetiva = Math.max(1, Math.round(incrementoBase * fatorCarga)); // Mínimo 1km/h de aceleração

        if (this.velocidade + aceleracaoEfetiva > this.velocidadeMaxima) {
            this.velocidade = this.velocidadeMaxima;
            this._playSound(this.audioErro);
            return `${this.modelo} atingiu a velocidade máxima de ${this.velocidadeMaxima} km/h.`;
        }
        this.velocidade += aceleracaoEfetiva;
        this._playSound(this.audioAcelerar);
        return `${this.modelo} acelerando para ${this.velocidade.toFixed(0)} km/h (Carga: ${this.cargaAtual}kg).`;
    }

    /**
     * Emite o som da buzina específica do caminhão.
     * @returns {string} Mensagem com o som da buzina.
     */
    buzinar() {
        if (!this.ligado) return super.buzinar();
        this._playSound(this.audioBuzina);
        return `Caminhão '${this.modelo}': FOOOOM! FOOOOM! 🚛`;
    }

    /**
     * Exibe informações do caminhão, incluindo carga atual e capacidade.
     * @returns {string} Informações formatadas do caminhão.
     */
    exibirInformacoes() {
        return `${super.exibirInformacoes()}\nCarga: ${this.cargaAtual}kg / ${this.capacidadeCarga}kg`;
    }
}