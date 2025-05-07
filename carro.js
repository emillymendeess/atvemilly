// js/Carro.js
import { Veiculo } from 'veiculo.js';

/**
 * @class Carro
 * @extends Veiculo
 * @classdesc Representa um carro comum, herdando de Veiculo.
 * Adiciona funcionalidades como velocidade e métodos específicos de carro.
 */
export class Carro extends Veiculo {
    /**
     * Cria uma instância de Carro.
     * @param {string} modelo - O modelo do carro.
     * @param {string} cor - A cor do carro.
     */
    constructor(modelo, cor) {
        super(modelo, cor);
        /** @property {number} velocidade - A velocidade atual do carro em km/h. */
        this.velocidade = 0;
        this.imagemUrl = "images/carro_comum.png";
        this.velocidadeMaxima = 200; // Velocidade máxima para carros comuns

        // Sons específicos
        this.audioBuzina = new Audio('audio/buzina_carro_som.mp3');
        this.audioAcelerar = new Audio('audio/acelerar_som.mp3');
        this.audioFrear = new Audio('audio/frear_som.mp3');
    }

    /**
     * Desliga o carro.
     * Impede o desligamento se o carro estiver em movimento.
     * @returns {string} Mensagem indicando o resultado da ação.
     */
    desligar() {
        if (this.ligado && this.velocidade > 0) {
            this._playSound(this.audioErro);
            return `${this._tipoVeiculo} '${this.modelo}' não pode ser desligado em movimento (Vel.: ${this.velocidade} km/h). Pare primeiro.`;
        }
        return super.desligar();
    }

    /**
     * Aumenta a velocidade atual do carro.
     * A aceleração só ocorre se o carro estiver ligado e abaixo da velocidade máxima.
     * @param {number} [incremento=10] - O valor a ser adicionado à velocidade. Padrão é 10.
     * @returns {string} Mensagem indicando o resultado da ação.
     */
    acelerar(incremento = 10) {
        if (!this.ligado) {
            this._playSound(this.audioErro);
            return `${this._tipoVeiculo} '${this.modelo}' está desligado. Não pode acelerar.`;
        }
        if (this.velocidade + incremento > this.velocidadeMaxima) {
            this.velocidade = this.velocidadeMaxima;
            this._playSound(this.audioErro); // Som de erro ou limite
            return `${this._tipoVeiculo} '${this.modelo}' atingiu a velocidade máxima de ${this.velocidadeMaxima} km/h.`;
        }
        this.velocidade += incremento;
        this._playSound(this.audioAcelerar);
        return `${this._tipoVeiculo} '${this.modelo}' acelerando para ${this.velocidade} km/h.`;
    }

    /**
     * Diminui a velocidade atual do carro.
     * A frenagem só ocorre se o carro estiver ligado e em movimento.
     * @param {number} [decremento=10] - O valor a ser subtraído da velocidade. Padrão é 10.
     * @returns {string} Mensagem indicando o resultado da ação.
     */
    frear(decremento = 10) {
        if (!this.ligado) {
            this._playSound(this.audioErro);
            return `${this._tipoVeiculo} '${this.modelo}' está desligado.`;
        }
        if (this.velocidade > 0) {
            this.velocidade = Math.max(0, this.velocidade - decremento);
            this._playSound(this.audioFrear);
            return `${this._tipoVeiculo} '${this.modelo}' freando para ${this.velocidade} km/h.`;
        }
        this._playSound(this.audioErro);
        return `${this._tipoVeiculo} '${this.modelo}' já está parado.`;
    }

    /**
     * Emite o som da buzina específica do carro.
     * @returns {string} Mensagem com o som da buzina.
     */
    buzinar() {
        if (!this.ligado) return super.buzinar(); // Delega para Veiculo se desligado
        this._playSound(this.audioBuzina);
        return `Carro '${this.modelo}': Biiii! Biiii! 🚗`;
    }

    /**
     * Exibe informações do carro, incluindo velocidade.
     * @returns {string} Informações formatadas do carro.
     */
    exibirInformacoes() {
        return `${super.exibirInformacoes()}\nVelocidade: ${this.velocidade} km/h (Max: ${this.velocidadeMaxima} km/h)`;
    }
}