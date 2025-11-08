export class ReportGenerator {
    constructor(database) {
        this.db = database;
    }

    /**
     * Gera um relatório de itens baseado no tipo e no usuário.
     */
    generateReport(reportType, user, items) {
        let report = '';
        let total = 0;

        report += this._generateHeader(reportType, user);

        // Passar variáveis por retorno
        const processedBody = this._generateBodyAndCalculateTotal(reportType, user, items);
        report += processedBody.reportBody;
        total = processedBody.total;

        report += this._generateFooter(reportType, total);

        return report.trim();
    }

    /**
     * Extrair a lógica de geração do cabeçalho
     */
    _generateHeader(reportType, user) {
        let header = '';
        if (reportType === 'CSV') {
            header += 'ID,NOME,VALOR,USUARIO\n';
        } else if (reportType === 'HTML') {
            header += '<html><body>\n';
            header += '<h1>Relatório</h1>\n';
            header += `<h2>Usuário: ${user.name}</h2>\n`;
            header += '<table>\n';
            header += '<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n';
        }
        return header;
    }

    /**
     * Lógica de iteração
     */
    _generateBodyAndCalculateTotal(reportType, user, items) {
        let reportBody = '';
        let total = 0;

        for (const item of items) {
            const itemResult = this._processSingleItem(reportType, user, item);
            
            if (itemResult) {
                reportBody += itemResult.reportLine;
                total += itemResult.itemValue;
            }
        }
        return { reportBody, total };
    }

    /**
     * Processar um único item
     */
    _processSingleItem(reportType, user, item) {
        let reportLine = null;
        let itemValue = 0;
        
        if (user.role === 'ADMIN') {
            this._handleAdminLogic(item);
            const lineData = this._generateReportLine(reportType, user, item);
            reportLine = lineData.line;
            itemValue = item.value;
            
        } else if (user.role === 'USER' && item.value <= 500) {
            const lineData = this._generateReportLine(reportType, user, item);
            reportLine = lineData.line;
            itemValue = item.value;
        }

        if (reportLine) {
            return { reportLine, itemValue };
        }
        return null;
    }
    
    /**
     * REGRA ADMIN
     */
    _handleAdminLogic(item) {
        if (item.value > 1000) {
            item.priority = true;
        }
    }

    _generateReportLine(reportType, user, item) {
        let line = '';
        if (reportType === 'CSV') {
            line = this._formatAsCSV(item, user);
        } else if (reportType === 'HTML') {
            line = this._formatAsHTML(item, user);
        }
        return { line };
    }

    _formatAsCSV(item, user) {
        return `${item.id},${item.name},${item.value},${user.name}\n`;
    }

    _formatAsHTML(item, user) {
        const style = item.priority ? 'style="font-weight:bold;"' : '';
        const styleAttribute = style ? ` ${style}` : '';
        return `<tr${styleAttribute}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
    }

    _generateFooter(reportType, total) {
        let footer = '';
        if (reportType === 'CSV') {
            footer += '\nTotal,,\n';
            footer += `${total},,\n`;
        } else if (reportType === 'HTML') {
            footer += '</table>\n';
            footer += `<h3>Total: ${total}</h3>\n`;
            footer += '</body></html>\n';
        }
        return footer;
    }
}