import fastifyStatic from '@fastify/static';
import Fastify from 'fastify';

import { downloadArticle } from './routes/download-article';
import { downloadComments } from './routes/download-comments';
import { downloadNote } from './routes/download-note';
import { imageProxy } from './routes/image-proxy';

const app = Fastify();

app.register(fastifyStatic, {
	root: `${process.cwd()}/dist`,
	index: 'index.html',
});

app.setNotFoundHandler((_request, reply) => {
	reply.sendFile('index.html');
});

// Routes
app.get('/download-article', downloadArticle);
app.get('/download-note', downloadNote);
app.get('/image-proxy', imageProxy);
app.get('/download-comments', downloadComments);

const port = Number.parseInt(process.env.PORT || '3000', 10);

console.log('Listening on port', port);

app.listen({ port: port, host: '0.0.0.0' }, (err) => {
	if (err) throw err;
});
