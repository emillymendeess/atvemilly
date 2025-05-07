// js/Manutencao.js

/**
 * @class Manutencao
 * @classdesc Representa um registro de manutenção para um veículo.
 * Contém informações sobre a data, tipo de serviço, custo e descrição da manutenção.
 */
export class Manutencao {
    /**
     * Cria uma instância de Manutencao.
     * @param {Date|string} data - A data da manutenção. Pode ser um objeto Date ou uma string no formato ISO (YYYY-MM-DD).
     * @param {string} tipo - O tipo de serviço realizado (ex: "Troca de Óleo").
     * @param {number} [custo=0] - O custo da manutenção.
     * @param {string} [descricao=''] - Uma descrição opcional da manutenção.
     */
    constructor(data, tipo, custo, descricao = '') {
        this.data = data instanceof Date ? data : new Date(data);
        this.tipo = tipo;
        this.custo = parseFloat(custo) || 0;
        this.descricao = descricao;
    }

    /**
     * Formata os detalhes da manutenção para exibição.
     * @returns {string} Uma string formatada com os detalhes da manutenção.
     * Ex: "DD/MM/AAAA - Troca de Óleo (R$ 150,00) | Detalhes adicionais"
     */
    formatar() {
        const df = this.data.toLocaleDateString('pt-BR', { timeZone: 'UTC' }); // Garante que a data seja interpretada como UTC
        const cf = this.custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        let info = `${df} - ${this.tipo} (${this.custo > 0 ? cf : 'Custo não definido'})`;
        if (this.descricao) info += ` | ${this.descricao}`;
        return info;
    }

    /**
     * Valida se os dados da manutenção são consistentes.
     * @returns {boolean} True se os dados são válidos, false caso contrário.
     */
    validar() {
        return (this.data instanceof Date && !isNaN(this.data.getTime())) &&
               (typeof this.tipo === 'string' && this.tipo.trim() !== '') &&
               (typeof this.custo === 'number' && this.custo >= 0);
    }

    /**
     * Converte o objeto Manutencao para um formato JSON simplificado,
     * útil para armazenamento no LocalStorage. A data é armazenada como YYYY-MM-DD.
     * @returns {object} Um objeto com as propriedades da manutenção prontas para JSON.
     */
    toJSON() {
        return {
            data: this.data.toISOString().split('T')[0], // Salva apenas a data YYYY-MM-DD
            tipo: this.tipo,
            custo: this.custo,
            descricao: this.descricao
        };
    }
}