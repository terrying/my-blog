import siteMetadata from '@/data/siteMetadata'
import Image from '@/components/Image'

export default function WelcomeBanner() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mb-8">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="relative px-6 py-12 sm:px-12 sm:py-16">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6">
            <Image
              src="/static/images/avatar.png"
              alt="Avatar"
              width={80}
              height={80}
              className="rounded-full border-4 border-white shadow-lg"
            />
          </div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl mb-4">
            欢迎来到 {siteMetadata.headerTitle}
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl leading-relaxed">
            分享一些关于企业信息安全建设的思考，以及与AI安全相关的见解。
          </p>
          
        </div>
      </div>
    </div>
  )
}