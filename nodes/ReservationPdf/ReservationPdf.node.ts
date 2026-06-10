import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import * as fs from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

export class ReservationPdf implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'JiMax Reservation PDF',
		name: 'jiMaxReservationPdf',
		icon: 'fa:file-pdf',
		group: ['transform'],
		version: 1,
		description: 'Generate a premium PDF reservation card for Le Marivaux',
		defaults: {
			name: 'JiMax Reservation PDF',
		},
		inputs: ['main' as any],
		outputs: ['main' as any],
		properties: [
			{
				displayName: 'Nom Complet',
				name: 'fullName',
				type: 'string',
				default: '',
				required: true,
				description: 'Le nom complet du client',
			},
			{
				displayName: 'Nombre de Personnes',
				name: 'numberOfPeople',
				type: 'number',
				default: 2,
				required: true,
				description: 'Nombre de personnes pour la réservation',
			},
			{
				displayName: 'Date & Heure',
				name: 'dateTime',
				type: 'string',
				default: '',
				required: true,
				description: 'La date et l\'heure de la réservation (ex: Samedi 20 Juin à 20:30)',
			},
			{
				displayName: 'Numéro de Téléphone',
				name: 'phone',
				type: 'string',
				default: '',
				required: true,
				description: 'Le numéro de téléphone du client',
			},
			{
				displayName: 'Code de Réservation',
				name: 'reservationCode',
				type: 'string',
				default: '',
				required: true,
				description: 'Le code unique de la réservation',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const fullName = this.getNodeParameter('fullName', i) as string;
				const numberOfPeople = this.getNodeParameter('numberOfPeople', i) as number;
				const dateTime = this.getNodeParameter('dateTime', i) as string;
				const phone = this.getNodeParameter('phone', i) as string;
				const reservationCode = this.getNodeParameter('reservationCode', i) as string;

				// Generate clean paths & filename
				const sanitizeFilename = (name: string) => {
					return name
						.toLowerCase()
						.replace(/\s+/g, '_')
						.replace(/[^a-z0-9_]/g, '');
				};

				const cleanName = sanitizeFilename(fullName);
				const cleanDt = sanitizeFilename(dateTime);
				const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
				const fileName = `${cleanName}_${cleanDt}_${randomCode}.pdf`;

				const dirPath = path.join(process.cwd(), 'reservationsPDFs');
				if (!fs.existsSync(dirPath)) {
					fs.mkdirSync(dirPath, { recursive: true });
				}
				const absolutePath = path.join(dirPath, fileName);

				// Generate QR Code buffer in-memory
				const qrCodeBuffer = await QRCode.toBuffer(reservationCode, {
					margin: 1,
					width: 100,
					color: {
						dark: '#d4af37',
						light: '#1a1a1a',
					},
				});

				// Create PDFKit document
				const doc = new PDFDocument({
					size: [600, 300],
					margins: { top: 0, bottom: 0, left: 0, right: 0 },
				});

				const writeStream = fs.createWriteStream(absolutePath);
				doc.pipe(writeStream);

				// 1. Draw Background
				doc.rect(0, 0, 600, 300).fill('#0c0c0c');

				// 2. Draw Borders
				doc.rect(10, 10, 580, 280).lineWidth(1).stroke('#1e1e1e');
				doc.rect(12, 12, 576, 276).lineWidth(0.5).stroke('rgba(212, 175, 55, 0.15)');

				// 3. Draw Gold Corners
				doc.lineWidth(2).strokeColor('#d4af37');
				
				// Top-Left corner
				doc.moveTo(12, 27).lineTo(12, 12).lineTo(27, 12).stroke();
				// Top-Right corner
				doc.moveTo(588, 27).lineTo(588, 12).lineTo(573, 12).stroke();
				// Bottom-Left corner
				doc.moveTo(12, 273).lineTo(12, 288).lineTo(27, 288).stroke();
				// Bottom-Right corner
				doc.moveTo(588, 273).lineTo(588, 288).lineTo(573, 288).stroke();

				// 4. Logo Positioning & Draw
				let logoPath = path.join(__dirname, '..', '..', '..', 'icons', 'logo_marivaux.png');
				if (!fs.existsSync(logoPath)) {
					logoPath = path.join(__dirname, '..', '..', 'icons', 'logo_marivaux.png');
				}
				if (!fs.existsSync(logoPath)) {
					logoPath = path.join(process.cwd(), 'icons', 'logo_marivaux.png');
				}

				if (fs.existsSync(logoPath)) {
					doc.image(logoPath, 240, 22, { width: 120 });
				}

				// 5. Subtitle
				doc.fillColor('#a0a0a0')
					.font('Helvetica')
					.fontSize(8)
					.text('MARRAKECH', 0, 75, { align: 'center', characterSpacing: 3 });

				// 6. Subtitle Divider
				doc.moveTo(270, 89).lineTo(330, 89).lineWidth(0.5).stroke('#d4af37');

				// 7. Dashed Separator
				doc.moveTo(380, 105)
					.lineTo(380, 230)
					.dash(4, { space: 4 })
					.lineWidth(0.5)
					.stroke('rgba(212, 175, 55, 0.25)');
				doc.undash();

				// 8. Left Column (Details)
				// Item 1: Client
				doc.fillColor('#a0a0a0')
					.font('Helvetica-Bold')
					.fontSize(7.5)
					.text('NOM COMPLET', 45, 110, { characterSpacing: 1.5 });
				doc.fillColor('#ffffff')
					.font('Helvetica')
					.fontSize(11.5)
					.text(fullName, 45, 122);

				// Item 2: Invités
				doc.fillColor('#a0a0a0')
					.font('Helvetica-Bold')
					.fontSize(7.5)
					.text("NOMBRE D'INVITÉS", 45, 142, { characterSpacing: 1.5 });
				doc.fillColor('#ffffff')
					.font('Helvetica')
					.fontSize(11.5)
					.text(`${numberOfPeople} Personne${numberOfPeople > 1 ? 's' : ''}`, 45, 154);

				// Item 3: Date & Heure
				doc.fillColor('#a0a0a0')
					.font('Helvetica-Bold')
					.fontSize(7.5)
					.text('DATE & HEURE', 45, 174, { characterSpacing: 1.5 });
				doc.fillColor('#ffffff')
					.font('Helvetica')
					.fontSize(11.5)
					.text(dateTime, 45, 186);

				// Item 4: Phone
				doc.fillColor('#a0a0a0')
					.font('Helvetica-Bold')
					.fontSize(7.5)
					.text('TÉLÉPHONE', 45, 206, { characterSpacing: 1.5 });
				doc.fillColor('#ffffff')
					.font('Helvetica')
					.fontSize(11.5)
					.text(phone, 45, 218);

				// 9. Right Column (QR Code Container & Value)
				doc.rect(425, 105, 110, 110).fill('#1a1a1a');
				doc.rect(425, 105, 110, 110).lineWidth(0.5).stroke('rgba(212, 175, 55, 0.3)');
				doc.image(qrCodeBuffer, 430, 110, { width: 100 });

				doc.fillColor('#a0a0a0')
					.font('Helvetica-Bold')
					.fontSize(7)
					.text('CODE DE RÉSERVATION', 400, 224, { width: 160, align: 'center', characterSpacing: 1.5 });

				doc.fillColor('#d4af37')
					.font('Times-Bold')
					.fontSize(16)
					.text(reservationCode, 400, 234, { width: 160, align: 'center', characterSpacing: 2 });

				// 10. Footer Section
				doc.moveTo(30, 258)
					.lineTo(570, 258)
					.lineWidth(0.5)
					.stroke('rgba(212, 175, 55, 0.15)');

				// Address
				doc.fillColor('#a0a0a0')
					.font('Helvetica-Bold')
					.fontSize(6)
					.text('ADRESSE', 30, 264, { characterSpacing: 1.2 });
				doc.fillColor('#ffffff')
					.font('Helvetica')
					.fontSize(7.5)
					.text('N 91, Residence Andalous, 2, 8 Rue du Draa, Marrakech 40000', 30, 272);

				// Hours
				doc.fillColor('#a0a0a0')
					.font('Helvetica-Bold')
					.fontSize(6)
					.text('HORAIRES', 400, 264, { width: 170, align: 'right', characterSpacing: 1.2 });
				doc.fillColor('#ffffff')
					.font('Helvetica')
					.fontSize(7.5)
					.text('07:00 AM - 01:00 AM', 400, 272, { width: 170, align: 'right' });

				// Finish drawing PDF and wait for save
				await new Promise<void>((resolve, reject) => {
					writeStream.on('finish', () => resolve());
					writeStream.on('error', (err) => reject(err));
					doc.end();
				});

				returnData.push({
					json: {
						status: 'success',
						pdfPath: absolutePath,
					},
					pairedItem: { item: i },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
