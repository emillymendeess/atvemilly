// js/CarroEsportivo.js
import { Carro } from 'carro.js';

/**
 * @class CarroEsportivo
 * @extends Carro
 * @classdesc Representa um carro esportivo, com funcionalidade de turbo.
 */
export class CarroEsportivo extends Carro {
    /**
     * Cria uma instância de CarroEsportivo.
     * @param {string} modelo - O modelo do carro esportivo.
     * @param {string} cor - A cor do carro esportivo.
     */
    constructor(modelo, cor) {
        super(modelo, cor);
        /** @property {boolean} turboAtivado - Indica se o turbo está ativado. */
        this.turboAtivado = false;
        this.imagemUrl = "images/carro_esportivo.png";
        this.velocidadeMaxima = 320; // Maior velocidade máxima

        // Sons específicos
        this.audioBuzina = new Audio('audio/buzina_esportivo_som.mp3');
        this.audioTurbo = new Audio('audio/turbo_ativar_som.mp3');
    }

    /**
     * Ativa o turbo do carro esportivo.
     * Só pode ser ativado se o carro estiver ligado.
     * @returns {string} Mensagem indicando o resultado da ação.
     */
    ativarTurbo() {
        if (!this.ligado) {
            this._playSound(this.audioErro);
            return `${this.modelo} está desligado. Não pode ativar o turbo.`;
        }
        if (!this.turboAtivado) {
            this.turboAtivado = true;
            this._playSound(this.audioTurbo);
            return `Turbo ATIVADO para ${this.modelo}! 🚀`;
        }
        this._playSound(this.audioErro);
        return `Turbo já está ativado em ${this.modelo}.`;
    }

    /**
     * Desativa o turbo do carro esportivo.
     * @returns {string} Mensagem indicando o resultado da ação.
     */
    desativarTurbo() {
        if (this.turboAtivado) {
            this.turboAtivado = false;
            // this._playSound(algumSomDeDesativarTurboSeExistir);
            return `Turbo DESATIVADO para ${this.modelo}.`;
        }
        this._playSound(this.audioErro);
        return `Turbo já está desativado em ${this.modelo}.`;
    }

    /**
     * Acelera o carro esportivo.
     * Se o turbo estiver ativado, a aceleração é maior.
     * @param {number} [incrementoBase=25] - O incremento base de velocidade.
     * @returns {string} Mensagem indicando o resultado da ação.
     */
    acelerar(incrementoBase = 25) {
        if (!this.ligado) {
             this._playSound(this.audioErro);
            return `${this.modelo} está desligado. Não pode acelerar.`;
        }

        let aceleracaoReal = this.turboAtivado ? incrementoBase * 1.8 : incrementoBase;
        aceleracaoReal = Math.round(aceleracaoReal); // Arredondar para evitar decimais estranhos na velocidade

        if (this.velocidade + aceleracaoReal > this.velocidadeMaxima) {
            this.velocidade = this.velocidadeMaxima;
            this._playSound(this.audioErro);
            return `${this.modelo} atingiu a velocidade máxima de ${this.velocidadeMaxima} km/h.`;
        }
        this.velocidade += aceleracaoReal;
        this._playSound(this.audioAcelerar); // Som de aceleração normal ou um específico para turbo
        return `${this.modelo} ${this.turboAtivado ? 'com TURBO 🔥 ' : ''}acelerando para ${this.velocidade.toFixed(0)} km/h.`;
    }

    /**
     * Emite o som da buzina específica do carro esportivo.
     * @returns {string} Mensagem com o som da buzina.
     */
    buzinar() {
        if (!this.ligado) return super.buzinar();
        this._playSound(this.audioBuzina);
        return `Carro Esportivo '${this.modelo}': VROOOM! PA-PA-PA! 🎺`;
    }

    /**
     * Exibe informações do carro esportivo, incluindo o estado do turbo.
     * @returns {string} Informações formatadas do carro esportivo.
     */
    exibirInformacoes() {
        return `${super.exibirInformacoes()}\nTurbo: ${this.turboAtivado ? 'Ativado 🔥' : 'Desativado ❄️'}`;
    }
}