import { Layout } from '@/components/Layout';
import { Award, Heart, Users, Clock } from 'lucide-react';

const values = [
  {
    icon: Heart,
    color: 'text-pink-500',
    title: 'Dibuat dengan Cinta',
    description: 'Setiap kue kami dibuat dengan penuh cinta dan perhatian terhadap detail.',
  },
  {
    icon: Award,
    color: 'text-amber-500',
    title: 'Kualitas Premium',
    description: 'Kami hanya menggunakan bahan-bahan berkualitas tinggi untuk produk terbaik.',
  },
  {
    icon: Users,
    color: 'text-purple-500',
    title: 'Keluarga',
    description: 'Usaha keluarga yang sudah turun-temurun menjaga resep tradisional.',
  },
  {
    icon: Clock,
    color: 'text-green-500',
    title: 'Selalu Fresh',
    description: 'Kue dibuat fresh setiap hari untuk menjaga kesegaran dan kelezatan.',
  },
];

export default function AboutPage() {
  return (
    <Layout>
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="text-amber-600 font-medium mb-2 block">Tentang Kami</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 ">
              Cerita Kue Rumahan
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Perjalanan kami dalam menyajikan kue-kue terbaik dengan cita rasa autentik rumahan
            </p>
          </div>

          {/* Story Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="aspect-video rounded-2xl bg-muted overflow-hidden shadow-card">
              <img
                src="/hero-bakery.jpg"
                alt="Our Story"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold mb-4">
                Dari Dapur Rumah ke Meja Anda
              </h2>
              <div className="space-y-4 text-foreground">
                <p>
                  Kue Rumahan berawal dari dapur sederhana ibu kami yang selalu menyajikan 
                  kue-kue lezat untuk keluarga dan tetangga. Resep turun-temurun yang dijaga 
                  dengan baik menjadi fondasi usaha kami.
                </p>
                <p>
                  Sejak tahun 2015, kami mulai melayani pesanan dari luar lingkungan, 
                  dan kini Kue Rumahan telah menjadi pilihan banyak keluarga untuk acara 
                  spesial mereka.
                </p>
                <p>
                  Kami berkomitmen untuk terus menjaga kualitas dan cita rasa autentik 
                  dalam setiap produk yang kami buat. Keamanan data pelanggan juga menjadi 
                  prioritas kami dengan menerapkan teknologi enkripsi modern AES-256.
                </p>
              </div>
            </div>
          </div>

          {/* Values */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                Nilai-Nilai Kami
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Prinsip yang kami pegang teguh dalam menjalankan usaha
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div
                  key={value.title}
                  className="text-center p-6 bg-card rounded-xl shadow-card animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className={`w-7 h-7 ${value.color}`} />
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-primary/10 rounded-2xl p-8 md:p-12">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                Keamanan Data Anda
              </h2>
              <p className="text-primary mb-6">
                Kami menjaga keamanan data pelanggan dengan teknologi enkripsi AES-256
              </p>
              
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
