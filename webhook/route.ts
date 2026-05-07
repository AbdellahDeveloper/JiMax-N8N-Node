import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    console.log('--- NEW WEBHOOK REQUEST RECEIVED ---');

    // 1. Log URL and Method
    console.log(`Method: ${req.method}`);
    console.log(`URL: ${req.url}`);

    // 2. Log Headers
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
        headers[key] = value;
    });
    console.log('Headers:', JSON.stringify(headers, null, 2));

    // 3. Log Query Parameters
    const url = new URL(req.url);
    const params: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
        params[key] = value;
    });
    console.log('Query Params:', JSON.stringify(params, null, 2));

    // 4. Log Body and Files
    const contentType = req.headers.get('content-type') || '';
    console.log(`Content-Type: ${contentType}`);

    try {
        if (contentType.includes('application/json')) {
            const body = await req.json();
            console.log('Body (JSON):', JSON.stringify(body, null, 2));
        } else if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            console.log('Body (FormData):');

            const formDataObj: Record<string, any> = {};

            for (const [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(`- File Field: ${key}`);
                    console.log(`  Name: ${value.name}`);
                    console.log(`  Type: ${value.type}`);
                    console.log(`  Size: ${value.size} bytes`);
                    formDataObj[key] = {
                        fileName: value.name,
                        fileType: value.type,
                        fileSize: value.size,
                    };
                } else {
                    console.log(`- Field: ${key} = ${value}`);
                    formDataObj[key] = value;
                }
            }
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
            const formData = await req.formData();
            const data: Record<string, any> = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            console.log('Body (Form URL Encoded):', JSON.stringify(data, null, 2));
        } else {
            const text = await req.text();
            console.log('Body (Text/Other):', text);
        }
    } catch (error) {
        console.error('Error parsing body:', error);
    }

    console.log('--- END OF REQUEST ---');

    return NextResponse.json({
        message: 'Webhook received and logged',
        timestamp: new Date().toISOString()
    });
}

// Support other methods too if needed
export async function GET(req: NextRequest) {
    return POST(req);
}

export async function PUT(req: NextRequest) {
    return POST(req);
}
